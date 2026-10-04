import { ref, onUnmounted } from 'vue';
import echoService from '@/services/echo.service';

export function useEcho() {
  const echo = echoService.getInstance();
  const activeChannels = ref(new Set());

  /**
   * Escuchar un canal privado
   */
  const listenPrivate = (channelName, eventName, callback) => {
    if (activeChannels.value.has(channelName)) {
      echo.leave(channelName);
      activeChannels.value.delete(channelName);
    }

    const channel = echo.private(channelName);

    channel.listen(`.${eventName}`, (data) => {
      callback(data);
    });
    
    channel.error(() => {});
    
    activeChannels.value.add(channelName);

    return channel;
  };

  /**
   * Escuchar un canal público
   */
  const listenPublic = (channelName, eventName, callback) => {
    const channel = echo.channel(channelName);

    channel.listen(`.${eventName}`, (data) => {
      callback(data);
    });
    
    channel.error(() => {});

    activeChannels.value.add(channelName);

    return channel;
  };

  /**
   * Escuchar un canal de presencia
   */
  const listenPresence = (channelName, eventName, callback) => {
    const channel = echo.join(channelName);

    channel.listen(`.${eventName}`, callback);
    activeChannels.value.add(channelName);

    return channel;
  };

  /**
   * Dejar de escuchar un canal
   */
  const leave = (channelName) => {
    echo.leave(channelName);
    activeChannels.value.delete(channelName);
  };

  /**
   * Dejar todos los canales activos
   */
  const leaveAll = () => {
    activeChannels.value.forEach((channelName) => {
      echo.leave(channelName);
    });
    activeChannels.value.clear();
  };

  /**
   * Debug: Mostrar canales activos
   */
  const showActiveChannels = () => {
    return Array.from(activeChannels.value);
  };

  // Limpiar al desmontar el componente
  onUnmounted(() => leaveAll());

  return {
    echo,
    listenPrivate,
    listenPublic,
    listenPresence,
    leave,
    leaveAll,
    showActiveChannels,
    activeChannels
  };
}
