//some GLOBALS
var CODE_CHANGED = false;

function hasCodeChanged()
{
    return CODE_CHANGED;
}

//as outlined here: http://stackoverflow.com/questions/3665115/create-a-file-in-memory-for-user-to-download-not-through-server
function saveString2File(filename, data) {
    var blob = new Blob([data], {type: 'text/javascript'});
    if(window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    }
    else{
        var elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;        
        document.body.appendChild(elem);
        elem.click();        
        document.body.removeChild(elem);
    }
}

function replaceSetupFunctionInput(input, newSetupFunction)
{
    var startIdx = input.indexOf("function setup()");
    var endIdx = input.indexOf("}//!setup");

    var before = input.substring(0, startIdx);
    var after = input.substring(endIdx, input.length);

    return before + newSetupFunction + after;
}


function generateSetupTabString(tab, tabValue)
{
    var result = "\tUI.tabs.push(\n\t\t{"
            + "\n\t\tvisible: " + tab.visible
            + ",\n\t\ttype: `" + tab.type + "`"
            + ",\n\t\ttitle: `" + tab.title + "`"
            + ",\n\t\tid: `" + tab.id + "`"
            + ",\n\t\tinitialValue: `" + tabValue + "`"
            + ",\n\t\tdescription: `" + tab.description + "`"
            + ",\n\t\twrapFunctionStart: `" + tab.wrapFunctionStart + "`"
            + ",\n\t\twrapFunctionEnd: `" + tab.wrapFunctionEnd + "`"
            + "\n\t}";

    result += ");\n\n";
    return result;
}

//Gets code from all tabs and generates setup function from them
function generateSetupFunction(UI)
{
    //make sure that something is loaded
    if(!UI.tabs)
    {
        console.log('No setup loaded!');
        return "";
    }

    var result = "function setup()\n{\n\tUI = {};\n\tUI.tabs = [];\n\tUI.titleLong = '" + UI.titleLong + "';\n\tUI.titleShort = '" + UI.titleShort + "';\n";
    if(UI.numFrames)
    {
        result += '\tUI.numFrames = ' + UI.numFrames + ';\n';
        result += '\tUI.maxFPS = ' + UI.maxFPS + ';\n';
    }
    if(UI.renderWidth && UI.renderHeight)
    {
        result += '\tUI.renderWidth = ' + UI.renderWidth + ';\n\tUI.renderHeight = ' + UI.renderHeight + ';\n\n';
    }

    var cmInstancesIdx = 0; //not all tabs have one of these (hidden!)
    for(var t = 0; t < UI.tabs.length; ++t)
    {
        if(UI.tabs[t].visible == false)
        {
            result += generateSetupTabString(UI.tabs[t], UI.tabs[t].initialValue);
        }
        else
        {
            result += generateSetupTabString(UI.tabs[t], UI.codemirrorInstances[cmInstancesIdx].getValue());
            cmInstancesIdx += 1;
        }
    }

    result += "\t return UI; \n"; //no closing bracket as we keep that
    return result;
}

//-------------------------WEBGL------------------------
var gl = null;
var GL_EXTENSIONS_UNAVAILABLE = true;
var GL_EXTENSIONS_MISSING = false;

//This is from https://www.khronos.org/registry/webgl/sdk/tests/js/webgl-test-utils.js
var browserPrefixes = [
  "",
  "MOZ_",
  "OP_",
  "WEBKIT_"
];

var getExtensionWithKnownPrefixes = function(name) {
  for (var ii = 0; ii < browserPrefixes.length; ++ii) {
    var prefixedName = browserPrefixes[ii] + name;
    var ext = gl.getExtension(prefixedName);
    if (ext) {
      return ext;
    }
  }
};

//Init webgl + extensions
function initGL(canvas) {
	try {
		gl = canvas.getContext("webgl");
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	} catch (e) {
	}
	if (!gl) {
		alert(```Could not initialise WebGL. This means that the app will not work.
        Please consider updating your drivers and chrome, as well as using a computer with a discrete GPU.```);
        return;
	}

    GL_EXTENSIONS_UNAVAILABLE = false;
}

function invokeCompute()
{
    //set current frame 
    $("#currentFrameInput").val(currentFrame);
    $("body").css("cursor", "progress");
    appData["it"] += 1;
    var canvas = $("#glRenderTarget").get(0);
    //Fall back to 'normal' mode if extensions are not available
    if(GL_EXTENSIONS_UNAVAILABLE)
    {
        $("#performanceChartDiv").html("<p>This feature does not work without WebGL Extensions</p>");
        compute(canvas); //do compute as specified by the script here
        var viewport = $("#glViewport").get(0);
        var viewportCtx = viewport.getContext('2d');
        viewportCtx.mozImageSmoothingEnabled = false;
        //viewportCtx.webkitImageSmoothingEnabled = false;
        viewportCtx.msImageSmoothingEnabled = false;
        viewportCtx.imageSmoothingEnabled = false;
        viewportCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, viewport.width, viewport.height);
        $("body").css("cursor", "default");
        CODE_CHANGED = false;
        return;
    }

    compute(canvas); //do compute as specified by the script here
    //copy the image to the actual display port
    var viewport = $("#glViewport").get(0);
    var viewportCtx = viewport.getContext('2d');
    viewportCtx.mozImageSmoothingEnabled = false;
	//viewportCtx.webkitImageSmoothingEnabled = false;
	viewportCtx.msImageSmoothingEnabled = false;
	viewportCtx.imageSmoothingEnabled = false;
    viewportCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, viewport.width, viewport.height);
    $("body").css("cursor", "default");
    CODE_CHANGED = false;
}

//ANIM STUFF
var currentFrame;
var requestStop;
var isPlaying;
var requestCallback;
var startPlaybackTime;
var endPlaybackTime;

function resetPlayback()
{
    currentFrame = 0;
    requestStop = false;
    isPlaying = false;
}

function stopPlayback()
{
    requestStopCB(function(){
        endPlaybackTime = new Date().getTime();
    });
}

function startPlayback()
{
    startPlaybackTime =  new Date().getTime();
    play();
}

//this is super ugly, should probably use requestAnimationFrame() -- will do after holiday
function play()
{
    //check once for a stop request//check if we have a request to cancel playback
    if(requestStop)
    {
        requestStop = false;
        isPlaying = false;
        requestCallback();
        return;
    }
    //check that we are not exceeding framerange
    if(currentFrame >= UI.numFrames)
    {
        requestStop = false;
        isPlaying = false;
        return;
    }
    //check if we have a request to cancel playback
    if(requestStop)
    {
        requestStop = false;
        isPlaying = false;
        requestCallback();
        return;
    }
    var targetFrameTime = (1.0 / UI.maxFPS) * 1000;
    var callTime = playFrame();
    //delay if we are too fast
    if(callTime < targetFrameTime)
    {
        setTimeout(play, targetFrameTime - callTime)
    }
    //otherwise just keep playing
    else
    {
        //keep UI responsive
        window.requestAnimationFrame(play);
    }
}

function playFrame()
{
    currentFrame += 1;
    var oldTime = new Date().getTime();
    invokeCompute();
    var newTime = new Date().getTime();
    var elapsedTime = newTime - oldTime;
    updateSmallViewerClone();
    return elapsedTime;
}

function requestStopCB(callback)
{
    if(!isPlaying)
    {
        callback();
        return;
    }
    requestCallback = callback;
    requestStop = true;
}

function getCurrentFrame()
{
    return currentFrame;
}

function getCurrentTime()
{
    if(isPlaying)
    {
        return (new Date().getTime() - startPlaybackTime);
    }
    else
    {
        return endPlaybackTime - startPlaybackTime;
    }
}

//Resizing
function increaseCanvasResolution()
{
    canvas = $("#glRenderTarget").get(0);
    if(canvas.width < 1600)
    {
        oldWidth = canvas.width;
        oldHeight = canvas.height;
        canvas.width = Math.round(oldWidth * 2);
        canvas.height = Math.round(oldHeight * 2);
        UI.renderHeight = canvas.height;
        UI.renderWidth = canvas.width;
        initGL($("#glRenderTarget").get(0));
    }
}

function decreaseCanvasResolution()
{
    canvas = $("#glRenderTarget").get(0);
    if(canvas.width > 100)
    {
        oldWidth = canvas.width;
        oldHeight = canvas.height;
        canvas.width = Math.round(oldWidth / 2);
        canvas.height = Math.round(oldHeight / 2);
        UI.renderHeight = canvas.height;
        UI.renderWidth = canvas.width;
        initGL($("#glRenderTarget").get(0));
    }
}

function getRenderTargetWidth()
{
    return $("#glRenderTarget").get(0).width;
}

function getRenderTargetHeight()
{
    return $("#glRenderTarget").get(0).height;
}

//UI stuff
function updateSmallViewerClone()
{
    var ctx_clone =  $("#glViewportSmallClone").get(0).getContext('2d');
    var cloneWidth = $("#glViewportSmallClone").get(0).width;
    var cloneHeight = $("#glViewportSmallClone").get(0).height;
    var width = $("#glRenderTarget").get(0).width;
    var height = $("#glRenderTarget").get(0).height;
    ctx_clone.drawImage($("#glRenderTarget").get(0), 0, 0,width, height, 0, 0, cloneWidth, cloneHeight);
}

//GENERAL FRAMEWORK STUFF-----------------------------------
var appData = null;

function resetApp()
{
    MAX_ROWS_PERF_BUFFER = 200;
    logIt = 0;
    logRenderingPerformanceBuffer =[];
    logRenderingPerformanceBufferAvg = 0;

    resetPlayback();
    //reset timestamps
    startPlaybackTime = 0;
    endPlaybackTime = 0;
}
//entrypoint for everything that needs to be done once
function initFramework()
{
    appData = {};
    resetApp();
    initGL($("#glRenderTarget").get(0));
    appData["it"] = 0;
}
