import { defineStore } from 'pinia';
import { reactive } from 'vue';

export const usePostStore = defineStore('social.post', () => {
  // Mapa de identidad (Identity Map) para los posts
  // Almacena una única referencia en memoria por cada ID de post
  const postPool = reactive({});

  /**
   * Sincroniza un array de posts (provenientes de la API) con el pool central.
   * Si el post ya existe, fusiona sus propiedades para mantener la reactividad en toda la app.
   * Si no existe, lo agrega al pool.
   * Retorna un array con las referencias reactivas del pool.
   *
   * @param {Array} posts Array de posts crudos
   * @returns {Array} Array de posts sincronizados reactivamente
   */
  const syncPosts = (posts) => {
    if (!posts || !Array.isArray(posts)) return [];

    return posts.map((post) => {
      if (!post || !post.id) return post;

      if (postPool[post.id]) {
        // Mantiene la referencia original de memoria, pero actualiza sus propiedades
        Object.assign(postPool[post.id], post);
      } else {
        postPool[post.id] = post;
      }

      return postPool[post.id];
    });
  };

  /**
   * Elimina un post del pool de memoria
   */
  const removePost = (postId) => {
    if (postPool[postId]) {
      delete postPool[postId];
    }
  };

  /**
   * Obtiene un post específico por su ID
   */
  const getPost = (postId) => {
    return postPool[postId] || null;
  };

  /**
   * Actualiza el avatar de todos los posts y comentarios que pertenezcan a un usuario.
   * Útil para cambiar la foto y que se refleje inmediatamente.
   */
  const updateAuthorAvatar = (authorId, newAvatarUrl) => {
    Object.values(postPool).forEach((post) => {
      // Actualizar autor del post
      if (post.author && post.author.id === authorId) {
        post.author.avatar = newAvatarUrl;
      }
      // Actualizar autores de los comentarios del post
      if (post.comments && Array.isArray(post.comments)) {
        post.comments.forEach((comment) => {
          if (comment.author && comment.author.id === authorId) {
            comment.author.avatar = newAvatarUrl;
          }
          // Si hay respuestas anidadas (según el backend)
          if (comment.replies && Array.isArray(comment.replies)) {
            comment.replies.forEach((reply) => {
              if (reply.author && reply.author.id === authorId) {
                reply.author.avatar = newAvatarUrl;
              }
            });
          }
        });
      }
    });
  };

  /**
   * OPTIMISTIC UPDATE: Toggle like instantáneamente
   * Actualiza el UI primero, luego sincroniza con servidor
   */
  const optimisticToggleLike = (postId) => {
    const post = postPool[postId];
    if (!post) return { wasLiked: false, newCount: 0 };

    const wasLiked = post.viewer_has_liked;
    const oldCount = post.likes_count || 0;
    
    post.viewer_has_liked = !wasLiked;
    post.likes_count = oldCount + (wasLiked ? -1 : 1);

    return { wasLiked, newCount: post.likes_count };
  };

  /**
   * Revertir cambio optimista de like si falla
   */
  const revertLike = (postId, wasLiked, originalCount) => {
    const post = postPool[postId];
    if (post) {
      post.viewer_has_liked = wasLiked;
      post.likes_count = originalCount;
    }
  };

  /**
   * OPTIMISTIC UPDATE: Agregar comentario instantáneamente
   *
   * BUG-008 FIX: Do NOT increment post.comments_count here.
   * The authoritative count comes from the server via the WebSocket
   * comment.created event payload (data.comments_count), which is set by
   * handleCommentCreated() in feed.store.js. Incrementing locally here would
   * cause the UI to show count+1 before the WS event, then jump to count+1
   * again when the WS event fires and overwrites with the DB value — resulting
   * in a visible flicker or, worse, an off-by-one if the job runs into a retry.
   *
   * The optimistic comment in the list (visible immediately via the _optimistic
   * flag) provides the UX feedback. The counter stays at the last-known server
   * value until the WS event updates it authoritatively.
   */
  const optimisticAddComment = (postId, comment) => {
    const post = postPool[postId];
    if (!post) return null;

    if (!post.comments) post.comments = [];

    // Agregar estado de "enviando"
    const optimisticComment = {
      ...comment,
      id: `temp-${Date.now()}`,
      _optimistic: true,
      _error: false
    };

    if (comment.parent_comment_id) {
      // Es una respuesta
      const parent = post.comments.find((c) => String(c.id) === String(comment.parent_comment_id));
      if (parent) {
        if (!parent.replies) parent.replies = [];
        parent.replies.push(optimisticComment);
        parent.replies_count = (parent.replies_count || 0) + 1;
        // BUG-008 FIX: Do NOT increment post.comments_count — let WS event set it.
      } else {
        // Si no encuentra el parent, puede ser que los comentarios no están cargados
        return null;
      }
    } else {
      // Es un comentario principal
      post.comments.push(optimisticComment);
      // BUG-008 FIX: Do NOT increment post.comments_count — let WS event set it.
    }

    return optimisticComment;
  };

  /**
   * Actualizar comentario optimista con datos reales del servidor.
   * 
   * Usamos Object.assign() en lugar de reemplazar arr[idx] porque necesitamos
   * mutar el objeto ORIGINAL que fue retornado por optimisticAddComment().
   * Si creamos un nuevo objeto, las referencias externas (como en el template
   * o en el scope de createComment) quedan apuntando al objeto viejo y no ven
   * el ID real → al editar envían el temp-* al backend = 404.
   */
  const syncComment = (postId, tempId, realComment) => {
    const post = postPool[postId];
    if (!post || !post.comments) return;

    const replaceInArray = (arr) => {
      const idx = arr.findIndex((c) => c.id === tempId);
      if (idx !== -1) {
        // Mutar el objeto existente preserva todas las referencias
        Object.assign(arr[idx], realComment, { _optimistic: false, _error: false });
        return true;
      }
      return false;
    };

    // Buscar en comentarios principales
    if (!replaceInArray(post.comments)) {
      // Buscar en respuestas
      for (const parent of post.comments) {
        if (parent.replies && replaceInArray(parent.replies)) {
          break;
        }
      }
    }
  };

  /**
   * Marcar comentario como error si falla el envío
   */
  const markCommentError = (postId, commentId) => {
    const post = postPool[postId];
    if (!post || !post.comments) return;

    const markError = (arr) => {
      const comment = arr.find((c) => c.id === commentId);
      if (comment) {
        comment._error = true;
        return true;
      }
      return false;
    };

    if (!markError(post.comments)) {
      for (const parent of post.comments) {
        if (parent.replies && markError(parent.replies)) {
          break;
        }
      }
    }
  };

  /**
   * Remover comentario (útil para retry después de error)
   */
  const removeComment = (postId, commentId) => {
    const post = postPool[postId];
    if (!post || !post.comments) return;

    const removeFromArray = (arr, parentRepliesCount = null) => {
      const idx = arr.findIndex((c) => c.id === commentId);
      if (idx !== -1) {
        arr.splice(idx, 1);
        post.comments_count = Math.max(0, (post.comments_count || 0) - 1);
        if (parentRepliesCount !== null) {
          parentRepliesCount.value = Math.max(0, parentRepliesCount.value - 1);
        }
        return true;
      }
      return false;
    };

    if (!removeFromArray(post.comments)) {
      for (const parent of post.comments) {
        if (parent.replies) {
          const repliesCountRef = { value: parent.replies_count || 0 };
          if (removeFromArray(parent.replies, repliesCountRef)) {
            parent.replies_count = repliesCountRef.value;
            break;
          }
        }
      }
    }
  };

  return {
    postPool,
    syncPosts,
    removePost,
    getPost,
    updateAuthorAvatar,
    optimisticToggleLike,
    revertLike,
    optimisticAddComment,
    syncComment,
    markCommentError,
    removeComment
  };
});
