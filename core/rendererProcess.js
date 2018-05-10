"use strict";
exports.__esModule = true;
var Path = require("path");
var Fs = require("fs");
var child_process_1 = require("child_process");
var testElectronSystem = function (CallBack) {
    try {
        var ele = require('electron');
    }
    catch (ex) {
        return CallBack(ex);
    }
    return CallBack();
};
var RendererProcess = /** @class */ (function () {
    function RendererProcess(forkName, data, debug, CallBack) {
        var _this = this;
        this.forkName = forkName;
        this.data = data;
        this.debug = debug;
        this.CallBack = CallBack;
        this.win = null;
        this._fork = null;
        this.file = Path.join(__dirname, 'render', this.forkName);
        testElectronSystem(function (err1) {
            if (err1) {
                console.log("RendererProcess: running system have not electron.");
                _this.file += '.js';
            }
            else {
                _this.file += '.html';
            }
            return Fs.access(_this.file, function (err) {
                if (err) {
                    return CallBack(err);
                }
                if (/.js$/.test(_this.file)) {
                    return _this.childProcess();
                }
                return _this.electronRendererProcess();
            });
        });
    }
    RendererProcess.prototype.childProcess = function () {
        var _this = this;
        var _fork = child_process_1.fork(this.file, this.data);
        _fork.once('close', function (code, signal) {
            console.log("RendererProcess exit");
            if (!_this.CallBack || typeof _this.CallBack !== 'function') {
                return;
            }
            if (!code) {
                _this.CallBack();
            }
            else {
                _this.CallBack(new Error("RendererProcess exit with code [" + code + "] signal [" + signal + "]"));
            }
            return _this.CallBack = null;
        });
        _fork.once('message', function (message) {
            console.log("RendererProcess [" + _this.forkName + "] on message");
            if (!_this.CallBack || typeof _this.CallBack !== 'function') {
                return;
            }
            _this.CallBack(null, message);
            _this.CallBack = null;
        });
    };
    RendererProcess.prototype.electronRendererProcess = function () {
        var _this = this;
        var _a = require('electron'), remote = _a.remote, screen = _a.screen, desktopCapturer = _a.desktopCapturer;
        this.win = new remote.BrowserWindow({ show: this.debug });
        this.win.setIgnoreMouseEvents(!this.debug);
        if (this.debug) {
            this.win.webContents.openDevTools();
            this.win.maximize();
        }
        this.win.once('first', function () {
            _this.win.once('firstCallBackFinished', function (returnData) {
                _this.win.close();
                _this.win = null;
                _this.CallBack(returnData);
                return _this.CallBack = null;
            });
            _this.win.emit('firstCallBack', _this.data);
        });
        this.win.once('closed', function () {
            if (_this.CallBack && typeof _this.CallBack === 'function') {
                _this.CallBack();
                return _this.CallBack = null;
            }
        });
        this.win.loadURL("file://" + Path.join(__dirname, name + '.html'));
    };
    RendererProcess.prototype.cancel = function () {
        if (this.win && typeof this.win.destroy === 'function') {
            return this.win.destroy();
        }
        if (this._fork) {
            return this._fork.kill();
        }
        console.log("RendererProcess on cancel but have not any ");
    };
    RendererProcess.prototype.sendCommand = function (command, data) {
        return this.win.emit(command, data);
    };
    return RendererProcess;
}());
exports["default"] = RendererProcess;
