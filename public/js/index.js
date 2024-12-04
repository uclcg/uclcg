/*! uclcg 2021-09-28 */

$(document).ready(function () {
    initFramework();
    var loadedScript = false;
    var CODE_CHANGED = true;
    var loadSetupButton = function (e) {

        // when loading from URL, jquery returns undefined data due to ajax crossdomain error. must use own repo
        // cf. https://stackoverflow.com/questions/8035629/jquery-getscript-returns-undefined/8036430
        var scriptURL = buttonMap[e.currentTarget.id].jsFile.substring(buttonMap[e.currentTarget.id].jsFile);
        $.getScript(scriptURL).done(function (data, textStatus) {
            if ($("#setupTabs").data("ui-tabs")) {
                clear(initFromJS, data, null, null);
            }
        }).fail(function (jqxhr, settings, exception) {
            alert("This resource has errors and cannot be loaded. Please notify a system administrator");
        });
    }

    //override control + s
    $(document).bind('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && (e.which == 83)) {
            e.preventDefault();
            currentFrame = 0;
            CODE_CHANGED = true;        // only updates mini viewer, not actually saves script so code change is still true
            updateAll();
            //save to history
            return false;
        }
    });

    window.addEventListener("beforeunload", function (e) {
        console.log('on unload, CODE_CHANGED:', CODE_CHANGED);
        if (typeof CODE_CHANGED !== 'undefined' && CODE_CHANGED == true) {
            const message = "You have unsaved changes. Do you really want to leave?";
            e.preventDefault(); // Required for modern browsers
            e.returnValue = message; // For legacy browsers
            return message;
        }
    });

    function clearAllDrawingCanvases() {
        var canvas = $("#glRenderTarget").get(0);
        gl = canvas.getContext("webgl");
        gl.clearColor(0.0, 0, 0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        var canvas = $("#glViewportSmallClone").get(0);
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    }

    //Function for clearing on reload
    function clear(callback, jsFileContents, initialResWidth, initialResHeight) {
        //reset app
        resetApp();
        //hide initial UI if necessary
        if ($("#setupTabs").data("ui-tabs")) {
            $("#setupTabs").tabs("destroy");
            $("#setupTabs").empty();
            $("#setupIntro").empty();
        }
        //reset all canvas objects
        clearAllDrawingCanvases();

        //remove codemirror instance
        if (UI.codemirrorInstances) {
            for (t = 0; t < UI.codemirrorInstances.length; ++t) {
                UI.codemirrorInstances[t].toTextArea();
            }
        }

        if (UI.tabs) {
            $("#implementationTabs").tabs("destroy");
            $("#implementationTabs").empty();
            $("#implementationTabs").append('<ul id="implementationTabsUL"></ul>');
        }
        UI.codemirrorInstances = [];
        UI = {};
        env = {};
        IO = {};
        $("#implementationTabs").tabs({
            create: function (ui, event) {
                callback(jsFileContents, initialResWidth, initialResHeight);    // initFromJS
            },
            active: 0,
            collapsible: true,
        });
    }

    env = {};
    UI = {};
    IO = {};

    //FRAMEWORK
    //experiment from js code
    function initFromJS(jsFileContents, initialResWidth, initialResHeight) {

        jsFileContents = jsFileContents.replace(`initGL(document.getElementById("glViewport"));`, "");

        //save file contents for later
        IO.inputFile = jsFileContents;
        //Try appending this file to the DOM
        try {
            var s = document.createElement('script');
            s.type = 'text/javascript';

            var code = jsFileContents;
            s.appendChild(document.createTextNode(code));
            document.body.appendChild(s);

        } catch (err) {
            alert("Your experiment template could not be loaded. Error: " + err.message);
            return;
        }

        //test whether this works
        UI = setup();
        if (initialResWidth != null && initialResHeight != null) {
            UI.renderWidth = initialResWidth;
            UI.renderHeight = initialResHeight;
        }
        //set canvas scale explicitly if defined
        if (UI.renderWidth && UI.renderHeight) {
            canvas = $("#glRenderTarget").get(0);
            canvas.width = Math.round(UI.renderWidth); //better be safe here
            canvas.height = Math.round(UI.renderHeight);
            initGL($("#glRenderTarget").get(0));
            $("#currentResolution").val(canvas.width + "x" + canvas.height);
        }
        //set frames if not available
        if (!UI.numFrames) {
            UI.numFrames = 1000;
            if (!UI.maxFPS) {
                UI.maxFPS = 24;
            }
        }

        $("#maxFramesInput").val(UI.numFrames);

        //set this to false at the start
        UI.showHidden = false;
        UI.codemirrorInstances = [];
        //Setup the UI as appropriate
        //page title
        $("#mainTitle").text("UCL Computer Graphics - " + UI.titleLong);

        //show viewer
        $("#viewerRow").show(80, function () {
            $("#viewerControls").show(80, function () {

                //tabs
                $('#tabSpace').show(80, function () {

                    for (t = 0; t < UI.tabs.length; ++t) {
                        if (UI.tabs[t].visible == false) {
                            continue;
                        }
                        //Initial UL
                        $("div#implementationTabs ul").append(
                            "<li><a href='#implementationTabs-" + t + "'>" + UI.tabs[t].title + "</a></li>"
                        );
                        //Tab Detail
                        $("div#implementationTabs").append(
                            "<div id='implementationTabs-" + t + "'><p>" + UI.tabs[t].description + "</p><p class='consoleLike'>" + UI.tabs[t].wrapFunctionStart + "</p><div><textarea id='integratorTextArea-" + t + "'> </textarea></div><p class='consoleLike'>" + UI.tabs[t].wrapFunctionEnd + "</p></div>"
                        );
                    }
                    //Create code editors
                    var codeMirrorInstanceIdx = 0;
                    for (t = 0; t < UI.tabs.length; ++t) {
                        if (UI.tabs[t].visible == false) {
                            continue;
                        }

                        if (UI.tabs[t].type == "text/javascript") {
                            UI.codemirrorInstances.push(CodeMirror.fromTextArea($("#integratorTextArea-" + t).get(0), {
                                mode: "javascript",
                                theme: "base16-dark",
                                //theme: "colorforth",
                                lineNumbers: true,
                                lineWrapping: true,
                                styleActiveLine: true,
                                autoCloseBrackets: true,
                                matchBrackets: true,
                                indentUnit: 4,
                                indentWithTabs: true,
                                viewpointMargin: Infinity,
                                extraKeys: {
                                    "Alt-F": "find", "Ctrl-F": "findPersistent", "Ctrl-Q": function (cm) {
                                        cm.foldCode(cm.getCursor());
                                    }
                                },
                                foldGutter: true,
                                gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
                            }));
                        }
                        else {
                            UI.codemirrorInstances.push(CodeMirror.fromTextArea($("#integratorTextArea-" + t).get(0), {
                                mode: "x-shader/x-fragment",
                                theme: "base16-dark",
                                //theme: "colorforth",
                                lineNumbers: true,
                                lineWrapping: true,
                                styleActiveLine: true,
                                autoCloseBrackets: true,
                                matchBrackets: true,
                                indentUnit: 4,
                                indentWithTabs: true,
                                viewpointMargin: Infinity,
                                extraKeys: {
                                    "Alt-F": "find", "Ctrl-F": "findPersistent", "Ctrl-Q": function (cm) {
                                        cm.foldCode(cm.getCursor());
                                    }
                                },
                                foldGutter: true,
                                gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
                            }));
                        }

                        UI.codemirrorInstances[codeMirrorInstanceIdx].setValue(UI.tabs[t].initialValue);
                        UI.codemirrorInstances[codeMirrorInstanceIdx].refresh();

                        UI.codemirrorInstances[codeMirrorInstanceIdx].on("change", function () {
                            CODE_CHANGED = true; // Mark as changed whenever the user edits
                            // console.log('detected code change from codemirror instance');
                        });

                        codeMirrorInstanceIdx += 1;
                    }

                    $("#implementationTabs").tabs("refresh");
                    $("#implementationTabs").tabs({active: 0});

                    // update
                    updateAllFunctions();
                    // init app
                    env = init();
                    CODE_CHANGED = true;
                    invokeCompute();
                    updateSmallViewerClone();

                });
            });
            //CODE_CHANGED = false;
        });
    }

    // How to load a new experiment
    function loadjsfile(fileName) {
        var reader = new FileReader();
        reader.onload = function (e) {
            var jsFileContents = this.result;
            var sanitized = replaceBackticksInSubstring(jsFileContents);
            clear(initFromJS, sanitized, null, null);
        };
        reader.readAsText(fileName);
    }

    function replaceBackticksInSubstring(inputString) { 
        return inputString.replace(/initialValue: `(.*?)}`,/gs, (match, p1) => { 
            // console.log('Captured substring:', p1); 
            const cleaned = p1.replace(/`/g, ''); 
            return 'initialValue: `' + cleaned + '}`,'; 
        });
    }

    // function updateAllFunctions() {
    //     var codeMirrorInstanceIdx = 0;
    //     for (var t = 0; t < UI.tabs.length; ++t) {
    //         try {
    //             var oldScriptTag = $('#' + UI.tabs[t].id).get(0);
    
    //             if (oldScriptTag) {
    //                 oldScriptTag.parentElement.removeChild(oldScriptTag);
    //             }
    
    //             var s = document.createElement('script');
    
    //             s.id = UI.tabs[t].id;
    //             s.type = UI.tabs[t].type;
    //             var code = "";
    //             if (UI.tabs[t].visible) {
    //                 code = UI.tabs[t].wrapFunctionStart + UI.codemirrorInstances[codeMirrorInstanceIdx].getValue() + UI.tabs[t].wrapFunctionEnd;
    //                 codeMirrorInstanceIdx += 1;
    //             } else {
    //                 code = UI.tabs[t].wrapFunctionStart + UI.tabs[t].initialValue + UI.tabs[t].wrapFunctionEnd;
    //             }
    //             s.appendChild(document.createTextNode(code));
    //             document.body.appendChild(s);
    
    //             // Re-attach the on("change") listener to ensure updates are detected
    //             if (UI.codemirrorInstances[codeMirrorInstanceIdx - 1]) {
    //                 UI.codemirrorInstances[codeMirrorInstanceIdx - 1].off("change"); // Remove existing listener if present
    //                 UI.codemirrorInstances[codeMirrorInstanceIdx - 1].on("change", function () {
    //                     CODE_CHANGED = true;
    //                     console.log("Code changed: CODE_CHANGED set to true");
    //                 });
    //             }
    
    //         } catch (err) {
    //             alert("Your function failed to execute. Reported error: " + err.message);
    //         }
    //     }
    // }

    function updateAllFunctions() {
        var codeMirrorInstanceIdx = 0;
        for (var t = 0; t < UI.tabs.length; ++t) {
            try {
                var oldScriptTag = $('#' + UI.tabs[t].id).get(0);
    
                if (oldScriptTag) {
                    oldScriptTag.parentElement.removeChild(oldScriptTag);
                }
    
                var s = document.createElement('script');
    
                s.id = UI.tabs[t].id;
                s.type = UI.tabs[t].type;
                var code = "";
                if (UI.tabs[t].visible) {
                    code = UI.tabs[t].wrapFunctionStart + UI.codemirrorInstances[codeMirrorInstanceIdx].getValue() + UI.tabs[t].wrapFunctionEnd;
                    codeMirrorInstanceIdx += 1;
                } else {
                    code = UI.tabs[t].wrapFunctionStart + UI.tabs[t].initialValue + UI.tabs[t].wrapFunctionEnd;
                }
                s.appendChild(document.createTextNode(code));
                document.body.appendChild(s);
    
                // Re-attach the on("change") listener to ensure updates are detected
                if (UI.codemirrorInstances[codeMirrorInstanceIdx - 1]) {
                    UI.codemirrorInstances[codeMirrorInstanceIdx - 1].off("change"); // Remove existing listener if present
                    UI.codemirrorInstances[codeMirrorInstanceIdx - 1].on("change", function () {
                        CODE_CHANGED = true;
                        // console.log("Code changed: CODE_CHANGED set to true");
                    });
                }
    
            } catch (err) {
                alert("Your function failed to execute. Reported error: " + err.message);
            }
        }
    }
    

    function updateAll() {
        updateAllFunctions();
        if(CODE_CHANGED) {
            init();
        }
        CODE_CHANGED = true;
        invokeCompute();
        updateSmallViewerClone();
    }

    $("#refreshButton").click(function () {
        CODE_CHANGED = true;
        updateAll();
    });

    $("#menuHelp").click(function (event) {
        event.preventDefault();
        $("#helpPage").modal();
    });

    $("#menuLoad").click(function () {
        $("#loadExperimentInput").trigger("click");
    });

    $("#menuSave").click(function () {
        //replace setup with new code
        var setupFunc = generateSetupFunction(UI);
        if (setupFunc == "") {
            return;
        }
        IO.outputFile = replaceSetupFunctionInput(IO.inputFile, setupFunc);
        //invoke save dialogue
        saveString2File(UI.titleShort + ".uclcg", IO.outputFile);
        CODE_CHANGED = false;
        // console.log('saved file, CODE_CHANGED is', CODE_CHANGED);
    });

    $("#loadExperimentInput").change(function () {
        loadjsfile(this.files[0]);
    });

    $("#reloadSamePage").click(function (event) {
        event.preventDefault();
        $("#reloadConfirm").modal();
    });

    $("#confirmPageReload").click(function () {
        location.reload();
    });

    $("#mainTitle").click(function (event) {
        event.preventDefault();
        $("#reloadConfirm").modal();
    });

    $(document).scroll(function () {
        var y = $(this).scrollTop();
        if (y > 210) {
            $('#floatingPreview').fadeIn();
        } else {
            $('#floatingPreview').hide();
        }
    });

    //Button callbacks

    $("#toFirstFrameButton").click(function () {
        if (UI.numFrames && currentFrame > 0) {
            requestStopCB(function () {
                currentFrame = 0;
                updateAll();
            });
        }
    });

    $("#toLastFrameButton").click(function () {
        if (UI.numFrames && currentFrame < UI.numFrames) {
            requestStopCB(function () {
                currentFrame = UI.numFrames;
                updateAll();
            });
        }
    });

    $("#frameForwardButton").click(function () {
        if (UI.numFrames && currentFrame < UI.numFrames) {
            currentFrame = Math.min(currentFrame + 1, UI.numFrames);
            updateAll();
        }
    });

    $("#frameBackwardButton").click(function () {
        if (UI.numFrames & currentFrame > 0) {
            currentFrame = Math.max(currentFrame - 1, 0);
            updateAll();
        }
    });

    $("#playButton").click(function () {
        if (UI.numFrames) {
            if (!isPlaying) {
                //reset some stuff
                requestStop = false;
                isPlaying = true;
                startPlayback();
            }
        }
    });

    //Stop on both stop and play button
    $("#stopButton").click(function () {
        if (UI.numFrames) {
            if (isPlaying) {
                stopPlayback();
            }
        }
    });

    //detect key changes on frame box
    $("#currentFrameInput").on("change paste keyup", function () {
        var currentValue = $(this).val();
        if (!isNaN(currentValue) && currentValue != '') {
            var newFrame = parseInt(currentValue);
            if (UI.numFrames && newFrame != currentFrame && newFrame >= 0 && newFrame <= UI.numFrames) {
                currentFrame = newFrame;
                updateAll();
            }
        }
    });
    //detect input for max frames
    $("#maxFramesInput").on("change paste keyup", function () {
        var currentValue = $(this).val();
        if (!isNaN(currentValue) && currentValue != '') {
            var newMaxFrames = parseInt(currentValue);
            if (UI.numFrames && newMaxFrames >= 0) {
                UI.numFrames = newMaxFrames;
            }
        }
    });


    $(document).keyup(function (e) {
        if (e.keyCode == 27) { // escape key maps to keycode `27`
            if (isPlaying) {
                stopPlayback();
            }
        }
    });

    //Resizing
    $("#decreaseResolutionButton").click(function () {
        decreaseCanvasResolution();
        canvas = $("#glRenderTarget").get(0)
        $("#currentResolution").val(canvas.width + "x" + canvas.height);
        currentFrame = 0;
        updateAll();
    });

    $("#increaseResolutionButton").click(function () {
        increaseCanvasResolution();
        canvas = $("#glRenderTarget").get(0)
        $("#currentResolution").val(canvas.width + "x" + canvas.height);
        currentFrame = 0;
        updateAll();
    });

    // replicate old database item
    class Setup {
        constructor(jsFile, category, picture, niceName, shortDescription, author, hidden) {
            this.jsFile = jsFile;
            this.category = category;
            this.picture = picture;
            this.niceName = niceName;
            this.shortDescription = shortDescription;
            this.author = author;
            this.hidden = hidden;
            this._id = 0;
        }
    }

    var getJSON = function(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'json';
        xhr.onload = function() {
            var status = xhr.status;
            if (status === 200) {
                callback(null, xhr.response);
            } else {
                callback(status, xhr.response);
            }
        };
        xhr.send();
    };

    // check if localhost --> no fileaccess 
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1" || location.hostname === "") {
        alert("Detected local server. Not serving up CW files and demos. \nYou can still load them manually, and use the renderer as expected");
    } else {
        getJSON('https://uclcg.github.io/uclcg/demos/db.json', function(err, data) {
            if (err !== null) {
                alert('Something went wrong: ' + err);
            }

            setups = [];
            for(var i = 0; i < data.categories.length; i++) {

                var isHidden = (data.hidden[i] === 'true');
                    var s = new Setup(data.jsFiles[i], data.categories[i], data.pictures[i],
                                      data.niceNames[i], data.shortDescriptions[i], data.authors[i], isHidden);
                    s._id = i;
                    setups.push(s);
            }

            // all setups read and created, the rest is display stuff, copied from above!
            tabbedSetups = [];
            for (var s = 0; s < setups.length; ++s) {

                if (!setups[s].hidden) {
                    // add empty list if category doesnt exist yet
                    if (!tabbedSetups[setups[s].category]) {
                        tabbedSetups[setups[s].category] = [];
                    }
                    tabbedSetups[setups[s].category].push(setups[s]);
                }
            }

            //remember for delete button callbacks
            buttonMap = [];

            var tabIdx = 0;
            Object.keys(tabbedSetups).forEach(function (key) {
                var lSetups = tabbedSetups[key];

                //Initial UL
                $("div#setupTabs ul").append(
                    "<li><a href='#setupTabs-" + tabIdx + "'>" + key + "</a></li>"
                );
                //Tab Detail
                $("div#setupTabs").append(
                    `<div id="setupTabs-` + tabIdx + `"></div>`
                );
                //add content
                var liDiv = $(`#setupTabs-` + tabIdx);
                liDiv.append("<div id=\"setupRow-" + key + "\"class=\"row display-flex\"></div>");
                for (var i = 0; i < lSetups.length; ++i) {
                    var parentRow = $("#setupRow-" + key);
                    var pic = lSetups[i].picture
                    var picIdx = lSetups[i].picture.lastIndexOf("/");
                    parentRow.append(`<div class="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                            <div class=" thumbnail">
                                                <a id="` + key + `_load_` + i + `" href="#" class="loadButton">
                                                <img src="` + pic.substring(0, picIdx + 1) + pic.substring(picIdx + 1) + `" alt="...">
                                                </a>
                                                <div class="caption">
                                                    <h3>` + lSetups[i].niceName + `</h3>
                                                    <p>` + lSetups[i].shortDescription + `</p>
                                                </div>
                                           </div>
                                          </div>`);
                    buttonMap[key + "_load_" + i] = {id: lSetups[i]._id, jsFile: lSetups[i].jsFile};
                    $('.loadButton').on('click', loadSetupButton);
                }
                tabIdx += 1;
            });
            $("#setupTabs").tabs();

        });
    }
});
