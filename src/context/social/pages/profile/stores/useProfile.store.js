import { ref } from 'vue';
import { defineStore } from 'pinia';
import { profileService } from '../services/profile.service.js';

export const useProfileStore = defineStore('social.profile', () => {
  const currentUser = ref(null);
  const users = ref([]);
  const posts = ref([]);
  const friends = ref([]);
  const requests = ref([]);
  const showComposer = ref(false);

  const fetchUser = async (id) => {
    try {
      const response = await profileService.fetchUser(id);
      if (response.success) {
        const userProfile = response.data.profile;
        userProfile.isFriend = response.data.isFriend || false;
        userProfile.hasPendingRequest = response.data.hasPendingRequest || false;
        userProfile.isPendingApproval = response.data.isPendingApproval || false;

        currentUser.value = userProfile;

        const index = users.value.findIndex((u) => u.id === userProfile.id);
        if (index !== -1) {
          users.value[index] = userProfile;
        } else {
          users.value.push(userProfile);
        }

        if (userProfile.id) {
          import('@social/shared/stores/useFriendship.store.js').then(({ useFriendshipStore }) => {
            useFriendshipStore().initStatus(userProfile.id, {
              isFriend: userProfile.isFriend,
              hasPendingRequestFrom: userProfile.isPendingApproval,
              hasSentPendingRequest: userProfile.hasPendingRequest
            });
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchFriends = async (id) => {
    try {
      const response = await profileService.fetchFriends(id);
      if (response.success) {
        // El controller devuelve { friends: [...], statistics: {...} }
        const rawFriends = response.data?.friends || response.data || [];
        friends.value = Array.isArray(rawFriends) ? rawFriends : [];

        import('@social/shared/stores/useFriendship.store.js').then(({ useFriendshipStore }) => {
          const friendshipStore = useFriendshipStore();
          friends.value.forEach((friend) => {
            friendshipStore.initStatus(friend.id, {
              isFriend: true,
              hasPendingRequestFrom: false,
              hasSentPendingRequest: false
            });
          });
        });
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const fetchRequests = async (id) => {
    try {
      const response = await profileService.fetchRequests(id);
      if (response.success) {
        requests.value = response.data || [];

        import('@social/shared/stores/useFriendship.store.js').then(({ useFriendshipStore }) => {
          const friendshipStore = useFriendshipStore();
          requests.value.forEach((req) => {
            friendshipStore.initStatus(req.id, {
              isFriend: req.is_friend,
              hasPendingRequestFrom: true, // We know this is a request towards us
              hasSentPendingRequest: req.has_sent_pending_request
            });
          });
        });
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const findUser = (id) => {
    if (currentUser.value && currentUser.value.id == id) return currentUser.value;
    return users.value.find((u) => u.id == id) || currentUser.value;
  };

  const fetchPosts = async (id) => {
    try {
      const response = await profileService.fetchPosts(id);
      if (response.success) {
        const rawPosts = response.data.posts || [];

        import('@social/shared/stores/usePost.store.js').then(({ usePostStore }) => {
          const postStore = usePostStore();
          posts.value = postStore.syncPosts(rawPosts);
        });
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      posts.value = [];
    }
  };

  const saveProfile = async (userId, data) => {
    try {
      const response = await profileService.updateProfile(userId, data);
      if (response.success) {
        await fetchUser(userId); // Reload full profile
        return true;
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      return false;
    }
  };

  const uploadAvatar = async (userId, file) => {
    try {
      const response = await profileService.uploadAvatar(userId, file);
      if (response.success) {
        const avatarUrl = response.data.avatar || response.data.avatar_url;
        if (currentUser.value) {
          currentUser.value.avatar_url = avatarUrl;
        }

        import('@social/pages/user/stores/useUser.store.js').then(({ useUserStore }) => {
          const userStore = useUserStore();
          if (userStore.user && userStore.user.id === userId) {
            userStore.user.avatar_url = avatarUrl;
            userStore.fetchUser(); // Refresh ME endpoint
          }
        });

        import('@social/shared/stores/usePost.store.js').then(({ usePostStore }) => {
          const postStore = usePostStore();
          postStore.updateAuthorAvatar(userId, avatarUrl);
        });

        return avatarUrl;
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  };

  const uploadCover = async (userId, file) => {
    try {
      const response = await profileService.uploadCover(userId, file);
      if (response.success) {
        const coverUrl = response.data.cover_url || response.data.cover;
        if (currentUser.value) {
          currentUser.value.cover_url = coverUrl;
        }

        import('@social/pages/user/stores/useUser.store.js').then(({ useUserStore }) => {
          const userStore = useUserStore();
          if (userStore.user && userStore.user.id === userId) {
            userStore.user.cover_url = coverUrl;
            userStore.fetchUser(); // Refresh ME endpoint
          }
        });

        return coverUrl;
      }
    } catch (error) {
      console.error('Error uploading cover:', error);
      throw error;
    }
  };

  return {
    currentUser,
    users,
    posts,
    friends,
    requests,
    showComposer,
    fetchUser,
    fetchFriends,
    fetchRequests,
    findUser,
    fetchPosts,
    saveProfile,
    uploadAvatar,
    uploadCover
  };
});
