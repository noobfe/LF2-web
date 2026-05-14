const _debugInfo = document.createElement('div');
_debugInfo.style.cssText = 'width:500px;height:200px;background:#f0f0f0;position:absolute;top:10px;border:1px solid #000;right:10px;z-index:99999;overflow-y:scroll';

let _containerAppended = false;

const _prepareLog = (state, str) => {
    const newLog = document.createElement('p');
    newLog.style.cssText = 'margin:0;min-width:600px;padding:2px 0 2px 5px';
    newLog.appendChild(document.createTextNode(
        '[' + (new Date()).format('hh:mm:ss') + '] [' + state + '] ' + str
    ));
    _debugInfo.appendChild(newLog);
    _debugInfo.scrollTop = _debugInfo.scrollHeight;
    return newLog;
};

export const DebugInfo = {
    Log: {
        info:    (str) => { _prepareLog('Info', str).style.backgroundColor = '#80ffff'; },
        error:   (str) => { _prepareLog('Error', str).style.backgroundColor = '#ff8080'; },
        warning: (str) => { _prepareLog('Warning', str).style.backgroundColor = '#ffff80'; },
        console: (str) => { console.log(str); },
    },
    show(dom) {
        _debugInfo.style.visibility = 'visible';
        _debugInfo.style.width = '500px';
        _debugInfo.style.height = '200px';
        _debugInfo.style.border = '1px solid #000';
        if (!_containerAppended) {
            (dom || document.body).appendChild(_debugInfo);
            _containerAppended = true;
        }
    },
    hide() {
        _debugInfo.style.visibility = 'hidden';
        _debugInfo.style.border = _debugInfo.style.width = _debugInfo.style.height = '0px';
    },
};

Framework.DebugInfo = DebugInfo;
