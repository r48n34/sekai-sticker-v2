export function timer(delay: number = 1000) {
  return new Promise(function (resolve) {
    setTimeout(resolve, delay);
  });
}

export function downloadFile(uri: string, name: string) {
  const link = document.createElement("a");
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function dataURLToBlob(uri: string) {
  const res = await fetch(uri);
  return await res.blob();
}
