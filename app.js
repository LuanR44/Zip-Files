document
  .getElementById("upload-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const fileInput = document.getElementById("file-input");
    const compressionFormat = document.getElementById("compression-format");
    const operation = document.querySelector(
      'input[name="operation"]:checked'
    ).value;
    const file = fileInput.files[0];

    document.addEventListener("DOMContentLoaded", clearFileInput);

    if (!file) {
      alert("Selecione um arquivo antes de enviar.");
      return;
    }

    try {
      let processedBlob;
      let fileExtension;

      if (operation === "compress") {
        if (compressionFormat.value === "zip") {
          processedBlob = await compressToZip(file);
          fileExtension = "zip";
        } 
      } else if (operation === "decompress") {
        if (!file.name.toLowerCase().endsWith('.zip')) {
            alert('Por favor, selecione um arquivo ZIP válido para descompactar.');
            return;
          }
        if (compressionFormat.value === "zip") {
          processedBlob = await decompressFromZip(file);
          fileExtension = "";
        } 
      }

      displayDownloadLink(processedBlob, file.name, fileExtension);
    } catch (error) {
      console.error(error);
      alert(
        "Ocorreu um erro ao processar o arquivo ou a opção não está disponível ainda."
      );
    }
  });

async function compressToZip(file) {
  const zip = new JSZip();
  zip.file(file.name, file);
  const zipBlob = await zip.generateAsync({ type: "blob" });
  return zipBlob;
}

async function decompressFromZip(file) {
  const zip = new JSZip();
  const fileArrayBuffer = await file.arrayBuffer();
  const loadedZip = await zip.loadAsync(fileArrayBuffer);
  const firstFileName = Object.keys(loadedZip.files)[0];
  const decompressedFile = await loadedZip.file(firstFileName).async("blob");
  const decompressedFileWithExtension = new File(
    [decompressedFile],
    firstFileName
  );
  return decompressedFileWithExtension;
}

function displayDownloadLink(fileOrBlob, originalFileName, fileExtension) {
    const downloadLinkContainer = document.getElementById('download-link');
    const downloadLink = document.createElement('a');
    const downloadFileName = fileOrBlob instanceof File ? fileOrBlob.name : getDownloadFileName(originalFileName, fileExtension);
    downloadLink.href = URL.createObjectURL(fileOrBlob);
    downloadLink.download = downloadFileName;
    downloadLink.textContent = `Clique aqui para baixar o arquivo ${downloadFileName}`;
    downloadLinkContainer.innerHTML = '';
    downloadLinkContainer.appendChild(downloadLink);
    downloadLinkContainer.classList.remove('hidden');
  
    // Limpar o campo de arquivo após a operação
    document.getElementById('file-input').value = '';
  }
  
function getDownloadFileName(originalFileName, fileExtension) {
  const fileNameWithoutExtension = originalFileName
    .split(".")
    .slice(0, -1)
    .join(".");
  return fileExtension
    ? `${fileNameWithoutExtension}.${fileExtension}`
    : fileNameWithoutExtension;
}
