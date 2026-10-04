import { API, Http } from '@shared/http/Http';

export const feedService = {
  getFeed: async (params = {}) => {
    return await Http.get(API.social.feed.global, params);
  },

  getPersonalFeed: async (params = {}) => {
    return await Http.get(API.social.feed.personal, params);
  },

  createPost: async (data) => {
    const formData = new FormData();
    if (data.body) formData.append('body', data.body);
    if (data.visibility) formData.append('visibility', data.visibility);
    if (data.link) formData.append('link', data.link);
    if (data.images && data.images.length) {
      data.images.forEach((img) => {
        formData.append('images[]', img.file);
      });
    }
    return await Http.post(API.social.posts, formData);
  },

  deletePost: async (postId) => {
    return await Http.delete(`${API.social.posts}/${postId}`);
  },

  updatePost: async (postId, data) => {
    const formData = new FormData();
    formData.append('_method', 'PUT');
    if (data.body !== undefined) formData.append('body', data.body);
    if (data.visibility) formData.append('visibility', data.visibility);
    if (data.link !== undefined) formData.append('link', data.link);
    if (data.images && data.images.length) {
      data.images.forEach((img) => {
        if (img.file) formData.append('images[]', img.file);
      });
    }
    return await Http.post(`${API.social.posts}/${postId}`, formData);
  },

  toggleLike: async (postId) => {
    return await Http.post(API.social.likes, {
      likeable_type: 'post',
      likeable_id: postId,
      reaction_type: 'like'
    });
  },

  getLikes: async (postId) => {
    return await Http.get(API.social.likes, {
      likeable_type: 'post',
      likeable_id: postId
    });
  },

  getComments: async (postId, page = 1) => {
    return await Http.get(API.social.comments, {
      social_post_id: postId,
      parent_comment_id: null,
      page,
      per_page: 10
    });
  },

  getReplies: async (postId, commentId, page = 1) => {
    return await Http.get(API.social.comments, {
      social_post_id: postId,
      parent_comment_id: commentId,
      page,
      per_page: 10
    });
  },

  /**
   * Crea un comentario en un post.
   * El backend genera automáticamente el idempotency key.
   *
   * @param {string} postId
   * @param {Object} data — comment payload
   */
  createComment: async (postId, data) => {
    return await Http.post(
      API.social.comments,
      { ...data, social_post_id: postId }
    );
  },

  updateComment: async (commentId, data) => {
    return await Http.put(`${API.social.comments}/${commentId}`, data);
  },

  deleteComment: async (commentId) => {
    return await Http.delete(`${API.social.comments}/${commentId}`);
  },

  toggleCommentLike: async (commentId) => {
    return await Http.post(API.social.likes, {
      likeable_type: 'comment',
      likeable_id: commentId,
      reaction_type: 'like'
    });
  },

  reportPost: async (postId, reason, details = null, blockUser = false) => {
    return await Http.post(API.social.reports, { post_id: postId, reason, details, block_user: blockUser });
  },

  storeView: async (postId, durationMs) => {
    return await Http.post(`${API.social.posts}/${postId}/view`, { duration_ms: durationMs });
  }
};
