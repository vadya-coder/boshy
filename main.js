(function () {
    const downloadFile = (blob, name) => {
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.style.display = 'none';
        link.href = url;
        link.download = name;
        document.body.append(link);
        link.click();
        URL.revokeObjectURL(url);
        link.remove();
    };
    const bufferToText = buffer => {
        console.log(buffer);
        const uint = new Uint8Array(buffer);
        let res = '';
        for (let i = 0; i < uint.length; i++) {
            res += String.fromCharCode(uint[i]);
        }
        return res;
    };
    const textToBuffer = str => {
        const buffer = new ArrayBuffer(str.length);
        const uint = new Uint8Array(buffer);
        for (let i = 0; i < uint.length; i++) {
            uint[i] = str.charCodeAt(i);
        }
        return buffer;
    };
    const convert = (data, key) => {
        const v11 = Array.from({
            length: 256
        }, (v, k) => k);
        const v6 = Array(256).fill(0);
        let v7 = 0;
        console.log(data);
        if (key !== undefined) {
            for (let i = 0; i < 256; i++) {
                if (v7 === key.length) {
                    v7 = 0;
                }
                v6[i] = key.charCodeAt(v7);
                v7++;
            }
        }
        v7 = 0;
        for (let i = 0; i < 256; i++) {
            v7 = (v6[i] + v11[i] + v7) % 256;
            let v10 = v11[i];
            v11[i] = v11[v7];
            v11[v7] = v10;
        }
        v7 = 0;
        const out = new ArrayBuffer(data.length);
        const uintOut = new Uint8Array(out);
        let i = 0;
        for (let j = 0; j < data.length; j++) {
            i = (i + 1) % 256;
            v7 = (v7 + v11[i]) % 256;
            let v10 = v11[i];
            v11[i] = v11[v7];
            v11[v7] = v10;
            let v12 = (v11[v7] + v11[i]) % 256;
            let v5 = v11[v12];
            uintOut[j] = data[j] ^ v5;
        }
        return out;
    };
    const clearFileInput = fileInp => {
        try {
            fileInp.value = '';
            if (fileInp.value) {
                fileInp.type = "text";
                fileInp.type = "file";
            }
        } catch (e) {
            console.log(e);
        }
    };
    class EditorElem {
        constructor() {
            this.textArea = document.createElement('textarea');
            this.saveBtn = document.createElement('button');
            this.saveBtn.classList.add('save-btn');
            {
                const textInBtn = document.createElement('span');
                textInBtn.innerText = 'Save';
                this.saveBtn.appendChild(textInBtn);
                for (let i = 0; i < 4; i++) {
                    const stick = document.createElement('span');
                    stick.classList.add('stick', `stick${i + 1}`);
                    textInBtn.appendChild(stick);
                }
            }
            this.saveBtn.addEventListener('click', () => {
                this.onSave();
            });
        }
        onSave() { }
        remove() {
            this.textArea.remove();
            this.saveBtn.remove();
        }
    }
    const fileInput = document.getElementById('file');
    const wrapper = document.querySelector('.wrapper');
    let editor = new EditorElem();
    fileInput.addEventListener('change', e => {
        const password = 'BLOB';
        editor.remove();
        editor = new EditorElem();
        if (e.target.files.length == 1) {
            console.log("File selected: ", e.target.files[0]);
            const file = e.target.files[0];
            fileInput.parentElement.querySelector('span').innerText = file.name;
            file.arrayBuffer().then(b => {
                const decoded = convert(new Uint8Array(b), password);
                editor.textArea.value = bufferToText(decoded);
                wrapper.appendChild(editor.textArea);
                wrapper.appendChild(editor.saveBtn);
                editor.onSave = () => {
                    const encoded = convert(new Uint8Array(textToBuffer(editor.textArea.value.replace(/\n/g, '\r\n'))), password);
                    fileInput.parentElement.querySelector('span').innerText = 'Select .ini file';
                    downloadFile(new Blob([new Uint8Array(encoded)]), file.name);
                    clearFileInput(fileInput);
                    editor.remove();
                };
            });
        }
    });
})();