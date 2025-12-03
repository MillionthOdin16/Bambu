document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('stlFile');
    const sliceBtn = document.getElementById('sliceBtn');
    const statusDiv = document.getElementById('status');
    const downloadArea = document.getElementById('downloadArea');
    const viewerDiv = document.getElementById('viewer');

    let uploadedFilePath = null;
    let stlViewer = null;

    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        statusDiv.textContent = 'Uploading...';
        sliceBtn.disabled = true;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();
            uploadedFilePath = data.filepath;
            statusDiv.textContent = 'Upload complete. Ready to slice.';
            sliceBtn.disabled = false;

            // Initialize or update viewer
            // Using stl_viewer library
            // We need to pass the file object directly or a URL. 
            // Since we have the file object locally in the browser, let's use a blob URL for preview
            const fileURL = URL.createObjectURL(file);
            
            if (!stlViewer) {
                 stlViewer = new StlViewer(viewerDiv, { models: [ {id:0, filename: fileURL} ] });
            } else {
                 stlViewer.clean();
                 stlViewer.add_model({id:0, filename: fileURL});
            }

        } catch (err) {
            console.error(err);
            statusDiv.textContent = 'Error uploading file.';
        }
    });

    sliceBtn.addEventListener('click', async () => {
        if (!uploadedFilePath) return;

        statusDiv.textContent = 'Slicing... (this may take a moment)';
        sliceBtn.disabled = true;
        downloadArea.innerHTML = '';

        const settings = {
            filepath: uploadedFilePath,
            printer_model: document.getElementById('printerModel').value,
            layer_height: document.getElementById('layerHeight').value,
            infill_density: document.getElementById('infillDensity').value,
            filament_type: document.getElementById('filamentType').value,
            support_enable: document.getElementById('supportEnable').checked
        };

        try {
            const response = await fetch('/slice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.details || 'Slicing failed');
            }

            statusDiv.textContent = 'Slicing complete!';
            sliceBtn.disabled = false;

            const link = document.createElement('a');
            link.href = data.download_url;
            link.textContent = 'Download G-code';
            link.className = 'download-btn';
            link.style.display = 'block';
            link.style.marginTop = '10px';
            link.style.fontWeight = 'bold';
            link.style.color = '#008f5d';
            
            downloadArea.appendChild(link);

        } catch (err) {
            console.error(err);
            statusDiv.textContent = `Error: ${err.message}`;
            sliceBtn.disabled = false;
        }
    });
});
