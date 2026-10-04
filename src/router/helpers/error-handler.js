export function handleModuleLoadError(error, to) {
  if (error.message.includes('Failed to fetch dynamically imported module')) {
    window.location.href = to.fullPath;
  }
}
