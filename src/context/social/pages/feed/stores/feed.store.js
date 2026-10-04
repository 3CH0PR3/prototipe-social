import { ref } from 'vue';
import { defineStore } from 'pinia';
import { feedService } from '../services/feed.service';
import { useToast } from '@shared/composables/useToast';
import { usePostStore } from '@social/shared/stores/usePost.store.js';
import { useUserStore } from '@social/pages/user/stores/useUser.store.js';
import { useAuthStore } from '@social/auth/stores/useAuth.store.js';

export const useFeedStore = defineStore('social.feed', () => {
  const toast = useToast();
  const postStore = usePostStore();
  const userStore = useUserStore();
  const authStore = useAuthStore();

  const items = ref([]);
  const filters = ref({ search: '', type: 'global' });
  const errorMsg = ref(null);
  const isFetched = ref(false);
  const isLoading = ref(false);
  const hasMore = ref(true);
  const nextCursor = ref(null);

  let fetchPromise = null;

  const setLoading = (v) => (isLoading.value = v);
  const setErrors = (err) => (errorMsg.value = err);
  const clearError = () => (errorMsg.value = null);

  const executeAsync = async (fn) => {
    clearError();
    setLoading(true);
    try {
      return await fn();
    } catch (err) {
      setErrors(err);
      
      const errors = err.response?.data?.errors;
      let msg = err.response?.data?.message;
      if (errors) {
        const firstKey = Object.keys(errors)[0];
        if (firstKey) msg = errors[firstKey][0];
      }
      
      toast.error(msg ?? 'Error inesperado');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // --- Private Helpers ---
  const _findPost = (postId) => {
    return postStore.getPost(postId) || items.value.find((p) => String(p.id) === String(postId)) || null;
  };

  const _findCommentNode = (postId, commentId) => {
    const post = _findPost(postId);
    if (!post || !post.comments)
      return {
        post: null,
        parent: null,
        comment: null,
        idx: -1,
        isReply: false
      };

    const idx = post.comments.findIndex((c) => String(c.id) === String(commentId));
    if (idx !== -1)
      return {
        post,
        parent: null,
        comment: post.comments[idx],
        idx,
        isReply: false
      };

    for (const parent of post.comments) {
      if (parent.replies) {
        const rIdx = parent.replies.findIndex((r) => String(r.id) === String(commentId));
        if (rIdx !== -1)
          return {
            post,
            parent,
            comment: parent.replies[rIdx],
            idx: rIdx,
            isReply: true
          };
      }
    }
    return { post, parent: null, comment: null, idx: -1, isReply: false };
  };

  // --- Actions ---
  const fetchPosts = async (isLoadMore = false, force = false) => {
    console.log('[DEBUG] fetchPosts llamado:', { isLoadMore, force, stack: new Error().stack });
    
    if (fetchPromise && !force) return fetchPromise;
    if (!isLoadMore && isFetched.value && !force && !filters.value.search) return items.value;
    if (isLoadMore && !hasMore.value) return items.value;

    return (fetchPromise = executeAsync(async () => {
      const params = {};
      if (filters.value.search) params.search = filters.value.search;
      if (isLoadMore && nextCursor.value) params.cursor = nextCursor.value;

      const resp =
        filters.value.type === 'personal'
          ? await feedService.getPersonalFeed(params)
          : await feedService.getFeed(params);

      const newItems = resp.data?.feeds ?? resp.data?.posts ?? [];
      
      // DEBUG: Ver comments_count inicial
      newItems.forEach(post => {
        if (post.comments_count > 0) {
          console.log('[DEBUG] Post cargado con comentarios:', {
            post_id: post.id,
            comments_count: post.comments_count,
            text: post.text?.substring(0, 30)
          });
        }
      });
      
      const synced = postStore.syncPosts(newItems);

      // Preserve optimistic comments when refreshing (not loadMore)
      if (!isLoadMore) {
        synced.forEach(freshPost => {
          const existing = items.value.find(p => String(p.id) === String(freshPost.id));
          if (existing?.comments) {
            // Preserve optimistic comments and replies
            const optimisticComments = existing.comments.filter(c => c._optimistic || c._processing || c._error);
            if (optimisticComments.length > 0) {
              freshPost.comments = freshPost.comments || [];
              
              // Merge: keep optimistic + add real comments that aren't duplicates
              const merged = [...freshPost.comments];
              optimisticComments.forEach(opt => {
                const isDupe = merged.some(c => String(c.id) === String(opt.id));
                if (!isDupe) {
                  merged.push(opt);
                }
              });
              
              freshPost.comments = merged;
            }
            
            // Also preserve optimistic replies within existing comments
            existing.comments.forEach(existingComment => {
              if (existingComment.replies) {
                const optReplies = existingComment.replies.filter(r => r._optimistic || r._processing || r._error);
                if (optReplies.length > 0) {
                  const freshComment = freshPost.comments?.find(c => String(c.id) === String(existingComment.id));
                  if (freshComment) {
                    freshComment.replies = freshComment.replies || [];
                    optReplies.forEach(opt => {
                      const isDupe = freshComment.replies.some(r => String(r.id) === String(opt.id));
                      if (!isDupe) {
                        freshComment.replies.push(opt);
                      }
                    });
                  }
                }
              }
            });
          }
        });
      }

      items.value = isLoadMore ? [...items.value, ...synced] : synced;

      const meta = resp.meta ?? resp.data?.meta ?? {};
      nextCursor.value = meta.next_cursor ?? null;
      hasMore.value    = meta.has_more ?? false;

      isFetched.value = true;
      return items.value;
    }).finally(() => (fetchPromise = null)));
  };

  const createPost = async (data) =>
    executeAsync(async () => {
      // Build local image previews for optimistic display
      const localImagePreviews = data.images?.map((img) => ({
        url: img.preview || (img.file ? URL.createObjectURL(img.file) : img),
        order_index: img.order_index || 0,
        _isLocal: true,
      })) || [];

      console.log('📝 [Post] Creando post optimista:', {
        has_images: localImagePreviews.length > 0,
        images_count: localImagePreviews.length
      });

      // ── Optimistic post ────────────────────────────────────────────────
      // Add a temporary post immediately so the UI feels instant.
      // It will be replaced by the real post when the WebSocket PostCreated
      // event arrives (handlePostCreated deduplicates by idempotencyKey and
      // then by real post.id).
      const user = userStore.user;
      const pi   = user?.personal_information || {};
      const tempId = `temp_post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const clientIdempotencyKey = data._idempotency_key || tempId;

      const optimisticPost = {
        id:             tempId,
        _tempId:        tempId,
        _idempotencyKey: clientIdempotencyKey,
        _optimistic:    true,
        text:           data.body || data.text || '',
        body:           data.body || data.text || '',
        visibility:     data.visibility || 'public',
        tags:           data.tags || [],
        images:         localImagePreviews,
        likes_count:    0,
        comments_count: 0,
        viewer_has_liked: false,
        time:           'ahora',
        created_at:     new Date().toISOString(),
        author: user ? {
          id:    user.id,
          name:  `${pi.first_name || ''} ${pi.paternal_surname || ''}`.trim() || user?.name || 'Usuario',
          avatar: user.avatar_url || user.avatar,
          avatar_url: user.avatar_url || user.avatar,
          personal_information: user.personal_information || {},
        } : null,
      };

      if (localImagePreviews.length > 0) {
        optimisticPost._uploading = true;
        optimisticPost._localImages = localImagePreviews;
        optimisticPost.status = 'processing';
        console.log('🖼️ [Post] Post con imágenes marcado como _uploading');
      }

      // Prepend to feed immediately
      items.value.unshift(optimisticPost);

      try {
        const resp = await feedService.createPost(data);
        const created = resp.data?.post ?? resp.data?.feed;

        console.log('✅ [Post] Post creado en backend:', {
          post_id: created?.id,
          status: created?.status,
          has_images: created?.images?.length > 0 || created?.media?.length > 0
        });

        if (created) {
          // Replace the optimistic post with the real API response.
          // The WebSocket PostCreated event will also arrive; handlePostCreated
          // will merge into this real entry (dedup by post.id) rather than
          // adding a third copy.
          const synced = postStore.syncPosts([created])[0];

          // Carry over image upload state if backend hasn't processed images yet
          if (localImagePreviews.length > 0) {
            if (!synced.images || synced.images.length === 0 || synced.status === 'processing') {
              synced._uploading    = true;
              synced._localImages  = localImagePreviews;
              synced.status        = synced.status || 'processing';
              console.log('🔄 [Post] Manteniendo estado _uploading (imágenes en procesamiento)');
            }
          }

          const idx = items.value.findIndex((p) => p._tempId === tempId);
          if (idx !== -1) {
            items.value[idx] = synced;
          } else {
            // Optimistic entry was already replaced by the WS event; nothing to do
          }

          toast.success('Publicación creada exitosamente');
          return synced;
        }

        // If no post in response, remove optimistic entry
        items.value = items.value.filter((p) => p._tempId !== tempId);
        toast.success('Publicación creada exitosamente');
        return created;

      } catch (error) {
        // Remove the optimistic entry on failure
        items.value = items.value.filter((p) => p._tempId !== tempId);
        throw error;
      }
    });

  const deletePost = async (id) =>
    executeAsync(async () => {
      await feedService.deletePost(id);
      postStore.removePost(id);
      items.value = items.value.filter((a) => a.id !== id);
      toast.success(' eliminada exitosamente');
    });

  const updatePost = async (id, data) =>
    executeAsync(async () => {
      const resp = await feedService.updatePost(id, data);
      let updated = resp.data?.post ?? resp.data?.feed;
      if (updated) {
        updated = postStore.syncPosts([updated])[0];
        const idx = items.value.findIndex((p) => p.id === id);
        if (idx !== -1) items.value[idx] = updated;
      }
      toast.success(' actualizada exitosamente');
      return updated;
    });

  const toggleLike = async (postId) => {
    const { wasLiked, newCount } = postStore.optimisticToggleLike(postId);
    const originalCount = newCount + (wasLiked ? 1 : -1);
    
    try {
      await feedService.toggleLike(postId);
      // 202 Accepted - El job procesará y WebSocket sincronizará el contador
    } catch {
      // Revertir solo si hay error de red/servidor
      postStore.revertLike(postId, wasLiked, originalCount);
      toast.error('Error al reaccionar a la publicación');
    }
  };

  const fetchLikes = async (postId) =>
    executeAsync(async () => {
      const res = await feedService.getLikes(postId);
      return res.data?.likes || res.data?.users || [];
    });

  const fetchComments = async (postId, page = 1) =>
    executeAsync(async () => {
      const res = await feedService.getComments(postId, page);
      const commentsList = res.data?.items || res.data?.comments || [];
      const post = _findPost(postId);

      if (post) {
        if (page === 1) {
          const optimistic = (post.comments || []).filter((c) => c._optimistic || c._error);
          const merged = commentsList.map((sc) => {
            const existing = (post.comments || []).find((c) => c.id === sc.id);
            if (existing?.replies) {
              const optReplies = existing.replies.filter((r) => r._optimistic || r._error);
              return { ...sc, replies: [...(sc.replies || []), ...optReplies] };
            }
            return sc;
          });
          post.comments = [...merged, ...optimistic];
        } else {
          post.comments = [...(post.comments || []), ...commentsList];
        }
      }
      return commentsList;
    });

  const fetchReplies = async (postId, commentId, page = 1) =>
    executeAsync(async () => {
      const res = await feedService.getReplies(postId, commentId, page);
      const repliesList = res.data?.items || res.data?.comments || res.data?.replies || [];
      const post = _findPost(postId);

      if (post?.comments) {
        const parent = post.comments.find((c) => String(c.id) === String(commentId));
        if (parent) {
          parent.replies = page === 1 ? repliesList : [...(parent.replies || []), ...repliesList];
        }
      }
      return repliesList;
    });

  const createComment = async (postId, commentData) => {
    const user = userStore.user;
    const pi = user?.personal_information || {};
    const fullName = `${pi.first_name || ''} ${pi.paternal_surname || ''}`.trim() || user?.name || 'Usuario';
    const timestamp = Math.floor(Date.now() / 1000);

    // NOTE: NO generamos idempotency key en el frontend
    // El backend lo genera automáticamente (server-generated fallback)
    // Usamos timestamp como identificador temporal para matching
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const optimisticComment = {
      id: tempId,
      _tempId: tempId,
      body: commentData.text || commentData.body,
      text: commentData.text || commentData.body,
      mentions: commentData.mentions || [],
      parent_comment_id: commentData.parent_comment_id,
      author: {
        id: user.id,
        name: fullName,
        avatar: user.avatar_url || user.avatar,
        avatar_url: user.avatar_url || user.avatar,
        personal_information: user.personal_information || {}
      },
      time: 'ahora',
      likes_count: 0,
      replies_count: 0,
      replies: [],
      viewer_has_liked: false,
      created_at: new Date().toISOString(),
      _optimistic: true,
      _processing: true,
      _error: false,
    };

    // Add to UI immediately using clean architecture
    const post = _findPost(postId);
    if (!post) return;

    if (!post.comments) post.comments = [];

    // Use strategy pattern for comment placement
    const addReply = (parentId) => {
      const findParentAndAddReply = (comments) => {
        for (const comment of comments) {
          if (String(comment.id) === String(parentId)) {
            if (!comment.replies) comment.replies = [];
            comment.replies.push(optimisticComment);
            comment.replies_count = (comment.replies_count || 0) + 1;
            return true;
          }
          if (comment.replies && findParentAndAddReply(comment.replies)) {
            return true;
          }
        }
        return false;
      };
      return findParentAndAddReply(post.comments);
    };

    // Clean conditional logic
    const added = commentData.parent_comment_id 
      ? addReply(commentData.parent_comment_id)
      : (post.comments.push(optimisticComment), true);

    // NO incrementar contador aquí - el WebSocket lo sincronizará

    try {
      const payload = {
        social_post_id: postId,
        body: commentData.text || commentData.body,
        mentions: commentData.mentions || [],
        parent_comment_id: commentData.parent_comment_id,
      };

      // NOTE: NO enviamos X-Idempotency-Key header
      // El backend genera automáticamente el idempotency key (server-generated)
      const res = await feedService.createComment(postId, payload);

      // El servidor retorna el idempotency_key que generó
      // Lo guardamos en el comentario optimista para matching con el WebSocket
      const confirmedKey = res.data?.idempotency_key;
      if (confirmedKey) {
        optimisticComment.idempotency_key = confirmedKey;
      }

      optimisticComment._accepted = true;
      optimisticComment._processing = false;

      // RC-003 FIX: Do NOT call fetchComments() on timeout.
      // fetchComments() replaces post.comments entirely, which races against
      // any in-flight WS events for *other* comments on the same post and
      // would wipe their optimistic placeholders too.
      //
      // Instead: if the WS event hasn't arrived in 8s, just silently resolve
      // the optimistic comment into a permanent non-optimistic entry so it
      // stays visible. The next full feed reload will correct it if needed.
      const timeoutId = setTimeout(() => {
        if (optimisticComment._optimistic) {
          console.warn('⚠️ WebSocket timeout — resolviendo comentario optimista sin WS', {
            temp_id: tempId,
          });
          // Resolve the optimistic entry in place; do not reload
          optimisticComment._optimistic = false;
          optimisticComment._processing = false;
          delete optimisticComment._timeout;
        }
      }, 8000);

      optimisticComment._timeout = timeoutId;

      return res.data;
    } catch (error) {
      optimisticComment._error = true;
      optimisticComment._processing = false;
      optimisticComment._errorMessage = error.response?.data?.message || 'Error al enviar';
      
      const apiMsg = error.response?.data?.errors?.body?.[0] || error.response?.data?.message;
      toast.error(apiMsg || 'Error al publicar comentario');
      
      throw error;
    }
  };

  const updateComment = async (postId, commentId, data) =>
    executeAsync(async () => {
      const res = await feedService.updateComment(commentId, data);
      const updatedComment = res.data?.item || res.data?.comment;
      const { post, parent, comment, idx, isReply } = _findCommentNode(postId, commentId);

      if (comment && updatedComment) {
        const merged = {
          ...comment,
          ...updatedComment,
          replies: comment.replies ?? [],
          replies_count: comment.replies_count ?? 0
        };
        if (isReply) parent.replies[idx] = merged;
        else post.comments[idx] = merged;
      }
      toast.success('Comentario actualizado');
      return updatedComment;
    });

  const deleteComment = async (postId, commentId) =>
    executeAsync(async () => {
      await feedService.deleteComment(commentId);
      const { post, parent, comment, idx, isReply } = _findCommentNode(postId, commentId);

      if (post && comment) {
        if (isReply) {
          parent.replies.splice(idx, 1);
          parent.replies_count = Math.max(0, (parent.replies_count || 0) - 1);
          post.comments_count = Math.max(0, (post.comments_count || 0) - 1);
        } else {
          // BUG-014 FIX: use ?? instead of || so that replies_count = 0 is
          // respected (0 is falsy, so || would skip to replies?.length and could
          // return a stale array length, causing incorrect comments_count decrement).
          const toSub = 1 + (comment.replies_count ?? comment.replies?.length ?? 0);
          post.comments.splice(idx, 1);
          post.comments_count = Math.max(0, (post.comments_count || 0) - toSub);
        }
      }
      toast.success('Comentario eliminado');
    });

  const toggleCommentLike = async (postId, commentId) => {
    const { comment } = _findCommentNode(postId, commentId);
    if (!comment) return;

    const original = comment.viewer_has_liked;
    const originalCount = comment.likes_count;
    
    // Actualización optimista
    comment.viewer_has_liked = !original;
    comment.likes_count += original ? -1 : 1;

    try {
      await feedService.toggleCommentLike(commentId);
      // 202 Accepted - El job procesará y WebSocket sincronizará el contador
    } catch {
      // Revertir solo si hay error
      comment.viewer_has_liked = original;
      comment.likes_count = originalCount;
      toast.error('Error al reaccionar al comentario');
    }
  };

  // ========================================================================
  // WEBSOCKET EVENT HANDLERS
  // ========================================================================

  const handlePostLiked = (data) => {
    const post = _findPost(data.social_post_id || data.post_id);
    if (post) {
      post.likes_count = data.likes_count;
      if (data.liker && data.liker.id === authStore.user?.id) {
        post.viewer_has_liked = data.is_liked;
      }
    }
  };

  const handleCommentCreated = (data) => {
    console.log('🔔 [WebSocket] handleCommentCreated llamado:', {
      social_post_id: data.social_post_id,
      comment_id: data.comment?.id,
      idempotency_key: data.comment?.idempotency_key?.substring(0, 16) + '...',
      body: data.comment?.body?.substring(0, 50),
    });

    const post = _findPost(data.social_post_id || data.post_id);

    if (!post) {
      console.warn('[Social] Post no encontrado:', data.social_post_id);
      return;
    }

    if (!post.comments) post.comments = [];

    const newComment = data.comment;

    // ── Deduplication: never add the same comment twice ────────────────────
    const alreadyRealIdx = post.comments.findIndex(
      (c) => !c._optimistic && String(c.id) === String(newComment.id)
    );
    if (alreadyRealIdx !== -1) {
      console.log('✅ [WebSocket] Comentario ya existe (dedup), actualizando in-place');
      // Update in place (e.g. server may have corrected a field)
      Object.assign(post.comments[alreadyRealIdx], newComment, {
        _optimistic: false,
        _processing: false,
        _error: false,
      });
      post.comments_count = data.comments_count;
      return;
    }

    // ── Find optimistic placeholder ────────────────────────────────────────
    let optimisticIdx = -1;

    // Priority 1: exact idempotency_key match (most reliable)
    if (newComment.idempotency_key) {
      optimisticIdx = post.comments.findIndex(
        (c) => c._optimistic && c.idempotency_key === newComment.idempotency_key
      );
      console.log('🔍 [WebSocket] Buscando por idempotency_key:', {
        key: newComment.idempotency_key.substring(0, 16) + '...',
        found: optimisticIdx !== -1,
        optimisticIdx
      });
    }

    // Priority 2: same author + same body
    // Search in top-level comments first, then in nested replies
    if (optimisticIdx === -1 && newComment.author?.id) {
      // A. Search in top-level comments
      optimisticIdx = post.comments.findIndex(
        (c) =>
          c._optimistic &&
          String(c.author?.id) === String(newComment.author?.id) &&
          (c.body || c.text) === (newComment.body || newComment.text)
      );

      // B. If not found and it's a reply, search in nested replies
      if (optimisticIdx === -1 && newComment.parent_comment_id) {
        for (let i = 0; i < post.comments.length; i++) {
          const comment = post.comments[i];
          if (comment.replies) {
            const replyIdx = comment.replies.findIndex(
              (r) =>
                r._optimistic &&
                String(r.author?.id) === String(newComment.author?.id) &&
                (r.body || r.text) === (newComment.body || newComment.text)
            );
            if (replyIdx !== -1) {
              // Found optimistic reply - update it in-place
              console.log('✅ [WebSocket] Resolviendo reply optimista:', {
                parent_id: comment.id,
                temp_id: comment.replies[replyIdx].id,
                real_id: newComment.id,
              });

              const oldReply = comment.replies[replyIdx];
              if (oldReply._timeout) {
                clearTimeout(oldReply._timeout);
                console.log('⏰ [WebSocket] Timeout cancelado (reply)');
              }

              Object.assign(comment.replies[replyIdx], newComment, {
                _optimistic: false,
                _processing: false,
                _error: false,
                _accepted: true,
              });

              post.comments_count = data.comments_count;
              return; // Exit early - reply was handled
            }
          }
        }
      }

      console.log('🔍 [WebSocket] Buscando por autor+body:', {
        author_id: newComment.author.id,
        body: newComment.body?.substring(0, 30),
        found: optimisticIdx !== -1,
        optimisticIdx
      });
    }

    // Handle top-level comment match
    if (optimisticIdx !== -1) {
      console.log('✅ [WebSocket] Resolviendo comentario optimista:', {
        temp_id: post.comments[optimisticIdx].id,
        real_id: newComment.id,
      });

      const oldComment = post.comments[optimisticIdx];
      if (oldComment._timeout) {
        clearTimeout(oldComment._timeout);
        console.log('⏰ [WebSocket] Timeout cancelado');
      }

      Object.assign(post.comments[optimisticIdx], newComment, {
        _optimistic: false,
        _processing: false,
        _error:      false,
        _accepted:   true,
      });
    } else {
      console.log('⚠️ [WebSocket] No hay comentario optimista, insertando como nuevo');
      // ── No optimistic match → insert as a new comment ──────────────────
      if (newComment.parent_comment_id) {
        const parent = post.comments.find(
          (c) => String(c.id) === String(newComment.parent_comment_id)
        );
        if (parent) {
          if (!parent.replies) parent.replies = [];
          // Check reply dedup too
          const replyExists = parent.replies.some(
            (r) => String(r.id) === String(newComment.id)
          );
          if (!replyExists) {
            parent.replies.push(newComment);
            parent.replies_count = (parent.replies_count || 0) + 1;
          }
        }
      } else {
        post.comments.push(newComment);
      }
    }

    // Sync authoritative count from server (single source of truth)
    post.comments_count = data.comments_count;

    console.log('[DEBUG] comments_count sincronizado:', {
      post_id:           post.id,
      comments_count:    post.comments_count,
      comments_in_array: post.comments?.length || 0,
      data_comments_count: data.comments_count,
    });
  };

  const handleCommentLiked = (data) => {
    const { comment } = _findCommentNode(data.social_post_id || data.post_id, data.comment_id);
    if (comment) {
      // Actualizar contador de likes desde el servidor
      comment.likes_count = data.likes_count;
      
      // Nota: viewer_has_liked se maneja con optimista en toggleCommentLike
      // Solo sincronizamos el contador global
    }
  };

  const handlePostImagesProcessed = (data) => {
    console.log('🖼️ [WebSocket] handlePostImagesProcessed llamado:', {
      post_id: data.post_id || data.social_post_id,
      media_count: data.media?.length || 0,
      status: data.status
    });

    const post = _findPost(data.post_id || data.social_post_id);
    if (!post) {
      console.warn('[Social] Post no encontrado para images ready:', data.post_id || data.social_post_id);
      return;
    }

    // Update with processed images
    if (data.media && data.media.length > 0) {
      console.log('✅ [WebSocket] Actualizando imágenes procesadas');
      post.images = data.media;
      post._uploading = false;
      post._localImages = null;
      post.status = data.status || 'published';
    }
  };

  const handlePostCreated = (data) => {
    const newPost = data.post;
    if (!newPost) {
      console.warn('[Social] handlePostCreated: payload inválido');
      return;
    }

    // 1. Already have a real entry with this ID → merge and return (idempotent)
    const realIdx = items.value.findIndex(
      (p) => !p._optimistic && String(p.id) === String(newPost.id)
    );
    if (realIdx !== -1) {
      const synced = postStore.syncPosts([newPost])[0];
      Object.assign(items.value[realIdx], synced);
      return;
    }

    const synced = postStore.syncPosts([newPost])[0];

    // 2. Have an optimistic temp entry created by createPost() for this post.
    //
    //    BUG-006 FIX: Match ONLY by idempotency key when available.
    //    The old fallback (any p._optimistic) could replace the WRONG optimistic
    //    post when two posts are in-flight simultaneously — e.g. a user double-taps
    //    "Publicar" or a retry race. The idempotency key is the only reliable
    //    correlation between the client-side optimistic entry and the WS event.
    //
    //    Strategy:
    //      a) If backend echoes _idempotency_key in the WS payload → match by key (exact)
    //      b) If no key in payload → match by tempId embedded in the post body/tags (none)
    //      c) Last resort: match the FIRST optimistic entry ONLY if there is exactly 1
    //         in-flight post (safe single-user scenario). Skip if >1 optimistic entries
    //         to avoid replacing the wrong one.
    let optimisticIdx = -1;

    // Priority 1: exact idempotency key match (most reliable, requires backend to echo it)
    if (newPost._idempotency_key || newPost.idempotency_key) {
      const key = newPost._idempotency_key || newPost.idempotency_key;
      optimisticIdx = items.value.findIndex(
        (p) => p._optimistic && p._idempotencyKey === key
      );
    }

    // Priority 2: single-in-flight fallback — ONLY safe when there is exactly 1
    //             optimistic post in the list (no ambiguity about which one to replace).
    if (optimisticIdx === -1) {
      const optimisticPosts = items.value.filter((p) => p._optimistic);
      if (optimisticPosts.length === 1) {
        optimisticIdx = items.value.findIndex((p) => p._optimistic);
      }
      // If >1 optimistic posts exist we cannot reliably match without a key,
      // so we fall through to case 3 (prepend as new post from another user).
    }

    if (optimisticIdx !== -1) {
      // Preserve upload state if images are still processing
      const old = items.value[optimisticIdx];
      if (old._uploading && (!synced.images || synced.images.length === 0 || synced.status === 'processing')) {
        synced._uploading   = true;
        synced._localImages = old._localImages;
        synced.status       = synced.status || 'processing';
      }
      items.value[optimisticIdx] = synced;
      return;
    }

    // 3. No existing entry → this is a post from another user (or we could not
    //    match our own optimistic entry); prepend it.
    items.value.unshift(synced);
  };

  return {
    items,
    hasMore,
    filters,
    errorMsg,
    isFetched,
    isLoading,
    fetchPosts,
    createPost,
    deletePost,
    updatePost,
    toggleLike,
    fetchLikes,
    fetchComments,
    fetchReplies,
    createComment,
    updateComment,
    deleteComment,
    toggleCommentLike,
    // WebSocket handlers
    handlePostLiked,
    handlePostCreated,
    handleCommentCreated,
    handleCommentLiked,
    handlePostImagesProcessed
  };
});
