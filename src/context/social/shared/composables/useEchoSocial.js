import { onMounted } from 'vue';
import { useEcho } from '@shared/composables/useEcho';
import { useFeedStore } from '@social/pages/feed/stores/feed.store';
import { useUserStore } from '@social/pages/user/stores/useUser.store';
import { useToast } from '@shared/composables/useToast';

/**
 * Composable para inicializar WebSockets en el módulo social.
 * Debe llamarse en el layout principal (SocialLayout.vue) para que esté
 * disponible en toda la aplicación.
 *
 * Escucha:
 * - Canal público: social.feed → actualizaciones globales (likes, nuevos posts)
 * - Canal privado: social.user.{userId} → notificaciones personales (comentarios, menciones, likes)
 *
 * BUG-004 FIX: comment.created must NOT be handled on BOTH channels for the
 * same user. The backend broadcasts comment.created on:
 *   1. public  social.feed          → all feed viewers
 *   2. private social.user.{commenter} → confirmation echo to the author
 *   3. private social.user.{postOwner} → notification to the post owner
 *
 * When the current user is the commenter, they were previously receiving the
 * event on channel 1 (public) AND channel 2 (private), causing
 * handleCommentCreated() to fire twice → double-resolution of the optimistic
 * comment and a second comments_count write.
 *
 * Fix: Only listen to comment.created on the PUBLIC channel. The private
 * social.user.{userId} channel only handles the toast notification to the
 * post owner. The commenter's own client relies solely on the public channel
 * event, which already contains the idempotency_key for deduplication.
 *
 * Exception: when the current user is the POST OWNER (not the commenter),
 * the private channel is the only channel that delivers the notification
 * toast. The public channel still handles the feed update for both cases.
 */
export function useEchoSocial() {
  const { listenPublic, listenPrivate, showActiveChannels } = useEcho();
  const feedStore = useFeedStore();
  const userStore = useUserStore();
  const toast = useToast();

  // Exponer para debugging en consola
  if (typeof window !== 'undefined') {
    window.__echoDebug = { showActiveChannels };
  }

  onMounted(() => {
    // ── PUBLIC channel: feed state updates ──────────────────────────────────
    // comment.created is handled HERE for ALL users (commenter and observers).
    // The private channel below does NOT call handleCommentCreated() to avoid
    // double-processing (BUG-004 fix).
    listenPublic('social.feed', 'comment.created', (data) => {
      feedStore.handleCommentCreated(data);
    });

    listenPublic('social.feed', 'post.liked', (data) => {
      feedStore.handlePostLiked(data);
    });

    listenPublic('social.feed', 'post.images.ready', (data) => {
      feedStore.handlePostImagesProcessed(data);
    });

    listenPublic('social.feed', 'post.created', (data) => {
      feedStore.handlePostCreated(data);
    });

    if (userStore.user?.id) {
      const userId = userStore.user.id;
      const channelName = `social.user.${userId}`;

      // ── PRIVATE channel: toast notifications ONLY ─────────────────────────
      // BUG-004 FIX: Do NOT call handleCommentCreated() here.
      // The feed update already happened via the public channel above.
      // This handler is only responsible for showing a notification toast
      // when SOMEONE ELSE comments on the current user's post.
      listenPrivate(channelName, 'comment.created', (data) => {
        // Only show toast when another user commented (not our own comments
        // — those are already handled optimistically in createComment())
        if (data.comment?.author?.id !== userId) {
          const authorName = data.comment?.author?.name || 'Alguien';
          toast.info(`${authorName} comentó en tu publicación`);
        }
        // NOTE: No handleCommentCreated() call here — public channel handles it.
      });

      listenPrivate(channelName, 'comment.liked', (data) => {
        feedStore.handleCommentLiked(data);
        if (data.liker?.id !== userId) {
          const likerName = data.liker?.name || 'Alguien';
          toast.info(`${likerName} reaccionó a tu comentario`);
        }
      });

      listenPrivate(channelName, 'user.mentioned', (data) => {
        const mentionerName = data.mentioner?.name || 'Alguien';
        const context = data.context === 'post' ? 'una publicación' : 'un comentario';
        toast.info(`${mentionerName} te mencionó en ${context}`);
      });

      listenPrivate(channelName, 'social.notification', (data) => {
        const notification = data.notification;
        if (notification) {
          const actorName = notification.actor?.name || 'Alguien';
          switch (notification.type) {
            case 'like':
              toast.info(`${actorName} reaccionó a tu publicación`);
              break;
            case 'comment':
              toast.info(`${actorName} comentó en tu publicación`);
              break;
            case 'follow':
              toast.info(`${actorName} comenzó a seguirte`);
              break;
            case 'friend_request':
              toast.info(`${actorName} te envió una solicitud de amistad`);
              break;
            case 'mention':
              toast.info(`${actorName} te mencionó`);
              break;
            default:
              console.warn('[Social] Tipo de notificación desconocido:', notification.type);
          }
        }
      });

      listenPrivate(channelName, 'post.images.ready', (data) => {
        feedStore.handlePostImagesProcessed(data);
      });
    } else {
      console.warn('⚠️ [Social] No hay usuario autenticado');
    }
  });

  return {
    // Exponer métodos si se necesitan desde el componente
    // Por ahora solo inicializa automáticamente
  };
}
