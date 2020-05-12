window.URL = window.URL || window.webkitURL;
const getFilenameMime = (fileName, CallBack) => {
    const exc = fileName.split('.');
    if (exc.length < 2) {
        CallBack();
    }
    const exc1 = exc[exc.length - 1];
    const ret = $.cookie(`mime.${exc1}`);
    if (ret && ret.length) {
        return CallBack(null, ret);
    }
    return _view.connectInformationMessage.sockEmit('mime', fileName, (err, data) => {
        if (err) {
            return CallBack(err);
        }
        $.cookie(`mime.${exc1}`, data, { expires: 720, path: '/' });
        return CallBack(null, data);
    });
};
const showHTMLComplete = (uuid, zipStream, CallBack) => {
    const errCallBack = err => {
        CallBack(err);
    };
    return JSZip.loadAsync(zipStream, { base64: true }).then(zip => {
        const ret = {
            img: null,
            html: null,
            folder: [],
            mhtml: null
        };
        const allFiles = Object.keys(zip.files);
        let currentFileName = allFiles.shift();
        const _CallBack = (content) => {
            if (content && content.length > 20) {
                const processFile = () => {
                    switch (currentFileName) {
                        case `${uuid}.html`: {
                            return ret.html = Buffer.from(content, 'base64').toString();
                        }
                        case `${uuid}.png`: {
                            return ret.img = Buffer.from(content, 'base64').toString();
                        }
                        case `${uuid}.mhtml`: {
                            return ret.mhtml = Buffer.from(content, 'base64').toString();
                        }
                        default: {
                            return ret.folder.push({ filename: currentFileName, data: content });
                        }
                    }
                };
                processFile();
            }
            if (currentFileName = allFiles.shift()) {
                return zip.files[currentFileName].async('base64').then(_CallBack, errCallBack);
            }
            return CallBack(null, ret);
        };
        if (currentFileName) {
            return zip.files[currentFileName].async('base64').then(_CallBack, errCallBack);
        }
        return CallBack(null, ret);
    }, errCallBack);
};
