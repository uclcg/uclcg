/*! uclcg 2021-09-27 */

$(document).ready(function(){initFramework();var e=function(e){var t=buttonMap[e.currentTarget.id].jsFile.substring(buttonMap[e.currentTarget.id].jsFile);console.log("Loading script:",t),$.getScript(t).done(function(e,t){console.log("data",e),console.log("textstatus",t),console.log("got into getScript"),$("#setupTabs").data("ui-tabs")&&(console.log("got into ifblock"),console.log(typeof e),n(o,e,null,null))}).fail(function(e,t,n){console.log("jqhxr",e),console.log("settings",t),console.log("exception:",n),alert("This resource has errors and cannot be loaded. Please notify a system administrator")})};function n(e,n,o,a){var r;if(console.log("got into clear"),console.log(typeof n),resetApp(),$("#setupTabs").data("ui-tabs")&&($("#setupTabs").tabs("destroy"),$("#setupTabs").empty(),$("#setupIntro").empty()),console.log("got after hide initial UI"),r=$("#glRenderTarget").get(0),gl=r.getContext("webgl"),gl.clearColor(0,0,0,1),gl.clear(gl.COLOR_BUFFER_BIT),(r=$("#glViewportSmallClone").get(0)).getContext("2d").clearRect(0,0,r.width,r.height),console.log("got after clearAllCanvas"),UI.codemirrorInstances)for(t=0;t<UI.codemirrorInstances.length;++t)UI.codemirrorInstances[t].toTextArea();console.log("got after codemirror"),UI.tabs&&($("#implementationTabs").tabs("destroy"),$("#implementationTabs").empty(),$("#implementationTabs").append('<ul id="implementationTabsUL"></ul>')),console.log("got after uiTabs"),UI.codemirrorInstances=[],UI={},env={},IO={},console.log("got after inits"),$("#implementationTabs").tabs({create:function(t,r){e(n,o,a)},active:0,collapsible:!0}),console.log("got after implementationTabs jquery")}function o(e,n,o){console.log("initFromJS1"),console.log(typeof e),console.log("jsfilecont:",e),e=e.replace('initGL(document.getElementById("glViewport"));',""),console.log("initFromJS2"),IO.inputFile=e;try{console.log("initFromJS3");var r=document.createElement("script");r.type="text/javascript";var i=e;r.appendChild(document.createTextNode(i)),document.body.appendChild(r),console.log("initFromJS4")}catch(e){return void alert("Your experiment template could not be loaded. Error: "+e.message)}UI=setup(),null!=n&&null!=o&&(UI.renderWidth=n,UI.renderHeight=o),console.log("initFromJS5"),UI.renderWidth&&UI.renderHeight&&(canvas=$("#glRenderTarget").get(0),canvas.width=Math.round(UI.renderWidth),canvas.height=Math.round(UI.renderHeight),initGL($("#glRenderTarget").get(0)),$("#currentResolution").val(canvas.width+"x"+canvas.height)),console.log("initFromJS6"),UI.numFrames||(UI.numFrames=1e3,UI.maxFPS||(UI.maxFPS=24)),$("#maxFramesInput").val(UI.numFrames),UI.showHidden=!1,UI.codemirrorInstances=[],console.log("initFromJS7"),$("#mainTitle").text("UCL Computer Graphics - "+UI.titleLong),$("#viewerRow").show(80,function(){$("#viewerControls").show(80,function(){$("#tabSpace").show(80,function(){for(t=0;t<UI.tabs.length;++t)0!=UI.tabs[t].visible&&($("div#implementationTabs ul").append("<li><a href='#implementationTabs-"+t+"'>"+UI.tabs[t].title+"</a></li>"),$("div#implementationTabs").append("<div id='implementationTabs-"+t+"'><p>"+UI.tabs[t].description+"</p><p class='consoleLike'>"+UI.tabs[t].wrapFunctionStart+"</p><div><textarea id='integratorTextArea-"+t+"'> </textarea></div><p class='consoleLike'>"+UI.tabs[t].wrapFunctionEnd+"</p></div>"));var e=0;for(t=0;t<UI.tabs.length;++t)0!=UI.tabs[t].visible&&("text/javascript"==UI.tabs[t].type?UI.codemirrorInstances.push(CodeMirror.fromTextArea($("#integratorTextArea-"+t).get(0),{mode:"javascript",theme:"base16-dark",lineNumbers:!0,lineWrapping:!0,styleActiveLine:!0,autoCloseBrackets:!0,matchBrackets:!0,indentUnit:4,indentWithTabs:!0,viewpointMargin:1/0,extraKeys:{"Alt-F":"find","Ctrl-F":"findPersistent","Ctrl-Q":function(e){e.foldCode(e.getCursor())}},foldGutter:!0,gutters:["CodeMirror-linenumbers","CodeMirror-foldgutter"]})):UI.codemirrorInstances.push(CodeMirror.fromTextArea($("#integratorTextArea-"+t).get(0),{mode:"x-shader/x-fragment",theme:"base16-dark",lineNumbers:!0,lineWrapping:!0,styleActiveLine:!0,autoCloseBrackets:!0,matchBrackets:!0,indentUnit:4,indentWithTabs:!0,viewpointMargin:1/0,extraKeys:{"Alt-F":"find","Ctrl-F":"findPersistent","Ctrl-Q":function(e){e.foldCode(e.getCursor())}},foldGutter:!0,gutters:["CodeMirror-linenumbers","CodeMirror-foldgutter"]})),UI.codemirrorInstances[e].setValue(UI.tabs[t].initialValue),UI.codemirrorInstances[e].refresh(),e+=1);$("#implementationTabs").tabs("refresh"),$("#implementationTabs").tabs({active:0}),a(),env=init(),CODE_CHANGED=!0,invokeCompute(),updateSmallViewerClone()})})})}function a(){for(var e=0,t=0;t<UI.tabs.length;++t)try{var n=$("#"+UI.tabs[t].id).get(0);n&&n.parentElement.removeChild(n);var o=document.createElement("script");o.id=UI.tabs[t].id,o.type=UI.tabs[t].type;var a="";UI.tabs[t].visible?(a=UI.tabs[t].wrapFunctionStart+UI.codemirrorInstances[e].getValue()+UI.tabs[t].wrapFunctionEnd,e+=1):a=UI.tabs[t].wrapFunctionStart+UI.tabs[t].initialValue+UI.tabs[t].wrapFunctionEnd,o.appendChild(document.createTextNode(a)),document.body.appendChild(o)}catch(e){alert("Your function failed to execute. Reported error: "+e.message)}}function r(){a(),CODE_CHANGED&&init(),CODE_CHANGED=!0,invokeCompute(),updateSmallViewerClone()}$(document).bind("keydown",function(e){if((e.ctrlKey||e.metaKey)&&83==e.which)return e.preventDefault(),currentFrame=0,CODE_CHANGED=!0,r(),!1}),env={},UI={},IO={},$("#refreshButton").click(function(){CODE_CHANGED=!0,r()}),$("#menuHelp").click(function(e){e.preventDefault(),$("#helpPage").modal()}),$("#menuLoad").click(function(){$("#loadExperimentInput").trigger("click")}),$("#menuSave").click(function(){var e=generateSetupFunction(UI);""!=e&&(IO.outputFile=replaceSetupFunctionInput(IO.inputFile,e),saveString2File(UI.titleShort+".uclcg",IO.outputFile))}),$("#loadExperimentInput").change(function(){var e,t;e=this.files[0],(t=new FileReader).onload=function(e){n(o,this.result,null,null)},t.readAsText(e)}),$("#reloadSamePage").click(function(e){e.preventDefault(),$("#reloadConfirm").modal()}),$("#confirmPageReload").click(function(){location.reload()}),$("#mainTitle").click(function(e){e.preventDefault(),$("#reloadConfirm").modal()}),$(document).scroll(function(){$(this).scrollTop()>210?$("#floatingPreview").fadeIn():$("#floatingPreview").hide()}),$("#toFirstFrameButton").click(function(){UI.numFrames&&currentFrame>0&&requestStopCB(function(){currentFrame=0,r()})}),$("#toLastFrameButton").click(function(){UI.numFrames&&currentFrame<UI.numFrames&&requestStopCB(function(){currentFrame=UI.numFrames,r()})}),$("#frameForwardButton").click(function(){UI.numFrames&&currentFrame<UI.numFrames&&(currentFrame=Math.min(currentFrame+1,UI.numFrames),r())}),$("#frameBackwardButton").click(function(){UI.numFrames&currentFrame>0&&(currentFrame=Math.max(currentFrame-1,0),r())}),$("#playButton").click(function(){UI.numFrames&&(isPlaying||(requestStop=!1,isPlaying=!0,startPlayback()))}),$("#stopButton").click(function(){UI.numFrames&&isPlaying&&stopPlayback()}),$("#currentFrameInput").on("change paste keyup",function(){var e=$(this).val();if(!isNaN(e)&&""!=e){var t=parseInt(e);UI.numFrames&&t!=currentFrame&&t>=0&&t<=UI.numFrames&&(currentFrame=t,r())}}),$("#maxFramesInput").on("change paste keyup",function(){var e=$(this).val();if(!isNaN(e)&&""!=e){var t=parseInt(e);UI.numFrames&&t>=0&&(UI.numFrames=t)}}),$(document).keyup(function(e){27==e.keyCode&&isPlaying&&stopPlayback()}),$("#decreaseResolutionButton").click(function(){decreaseCanvasResolution(),canvas=$("#glRenderTarget").get(0),$("#currentResolution").val(canvas.width+"x"+canvas.height),currentFrame=0,r()}),$("#increaseResolutionButton").click(function(){increaseCanvasResolution(),canvas=$("#glRenderTarget").get(0),$("#currentResolution").val(canvas.width+"x"+canvas.height),currentFrame=0,r()});class i{constructor(e,t,n,o,a,r,i){this.jsFile=e,this.category=t,this.picture=n,this.niceName=o,this.shortDescription=a,this.author=r,this.hidden=i,this._id=0}}var s,l,c;s="https://uclcg.github.io/uclcg/demos/db.json",l=function(t,n){null!==t&&alert("Something went wrong: "+t),setups=[];for(var o=0;o<n.categories.length;o++){var a="true"===n.hidden[o];(r=new i(n.jsFiles[o],n.categories[o],n.pictures[o],n.niceNames[o],n.shortDescriptions[o],n.authors[o],a))._id=o,r.jsFile="https://mfischer-ucl.github.io/uclcg/demos/cw1_student.uclcg",setups.push(r)}console.log("Created",setups.length,"setups. Displaying them now");for(o=0;o<setups.length;++o)"Coursework 1 - 2021/22"==setups[o].niceName&&console.log(setups[o].jsFile),console.log("setup",setups[o]._id,"  ",o,setups[o].hidden);tabbedSetups=[];for(var r=0;r<setups.length;++r)setups[r].hidden||(console.log("setup",r,"hidden = false"),tabbedSetups[setups[r].category]||(console.log("setup",r,"innerloop"),tabbedSetups[setups[r].category]=[]),tabbedSetups[setups[r].category].push(setups[r]),console.log("pushed setup"));console.log("TabbedSetupsLength:",tabbedSetups.length);for(o=0;o<tabbedSetups.length;o++)console.log("TabbedSetupCategories:",tabbedSetups[o]);buttonMap=[];var s=0;Object.keys(tabbedSetups).forEach(function(t){var n=tabbedSetups[t];$("div#setupTabs ul").append("<li><a href='#setupTabs-"+s+"'>"+t+"</a></li>"),$("div#setupTabs").append('<div id="setupTabs-'+s+'"></div>'),$("#setupTabs-"+s).append('<div id="setupRow-'+t+'"class="row display-flex"></div>');for(var o=0;o<n.length;++o){var a=$("#setupRow-"+t),r=n[o].picture,i=n[o].picture.lastIndexOf("/");a.append('<div class="col-xs-12 col-sm-6 col-md-4 col-lg-3">\n                                        <div class=" thumbnail">\n                                            <a id="'+t+"_load_"+o+'" href="#" class="loadButton">\n                                            <img src="'+r.substring(0,i+1)+r.substring(i+1)+'" alt="...">\n                                            </a>\n                                            <div class="caption">\n                                                <h3>'+n[o].niceName+"</h3>\n                                                <p>"+n[o].shortDescription+"</p>\n                                            </div>\n                                       </div>\n                                      </div>"),buttonMap[t+"_load_"+o]={id:n[o]._id,jsFile:n[o].jsFile},$(".loadButton").on("click",e)}s+=1}),$("#setupTabs").tabs()},(c=new XMLHttpRequest).open("GET",s,!0),c.responseType="json",c.onload=function(){var e=c.status;l(200===e?null:e,c.response)},c.send()});