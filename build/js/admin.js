$(document).ready(function () {

    var socket = io();

    var buttonMap = [];
    var isDeleting = false;
    var numJSRequests = 0;

    var populateSpaceForSetups = function() {
        // populate space for setups

        //get items from the server
        socket.emit('getAllSetups', {});
        socket.on('returnAllSetups', function (data) {
            console.log("In ADMIN.JS -- this shouldn't happen!");
            var setups = JSON.parse(data);
            //make sure everything has a category
            for (var gI = 0; gI < setups.length; ++gI) {
                if (setups[gI].category == "") {
                    setups[gI].category = "Default";
                }
            }
            //get and clean parent div
            var parentDiv = $("#spaceForSetups");
            parentDiv.empty();
            //sort setups into tabs
            tabbedSetups = [];
            var firstTab = "";
            for (var s = 0; s < setups.length; ++s) {
                if (s == 0) {
                    firstTab = setups[s].category;
                }
                if (tabbedSetups[setups[s].category]) {
                }
                else {
                    tabbedSetups[setups[s].category] = [];
                }
                tabbedSetups[setups[s].category].push(setups[s]);
            }
            //remember for delete button callbacks
            buttonMap = [];
            parentDiv.append('<ul id="setupTabs" class="nav nav-tabs"></ul>');
            parentDiv.append('<div id="setupTabsContent" class="tab-content"></div>');
            Object.keys(tabbedSetups).forEach(function (key) {
                var lSetups = tabbedSetups[key];
                var isFirst = key == firstTab;
                //add to ul
                if (isFirst) {
                    $("#setupTabs").append('<li class="active" id="tab_' + key + '"><a data-toggle="tab" href="#' + key + '">' + key + '</a></li>');
                }
                else {
                    $("#setupTabs").append('<li id="tab_' + key + '"><a data-toggle="tab" href="#' + key + '">' + key + '</a></li>');
                }
                //add content
                if (isFirst) {
                    $("#setupTabsContent").append('<div id="' + key + '" class="tab-pane fade in active"></div>');
                }
                else {
                    $("#setupTabsContent").append('<div id="' + key + '" class="tab-pane fade"></div>');
                }
                var liDiv = $('#' + key);

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
                                                <p><a id="` + key + `_delete_` + i + `" href="#" class="deleteButton btn btn-primary" role="button">Delete</a></p>
                                                <p><label style="cursor:pointer"><input id="` + key + `_hidden_` + i + `" type="checkbox" class="hideCheckbox" name="hidden"/> Hidden </label></p>
                                            </div>
                                        </div>
                                      </div>`);

                    buttonMap[key + "_delete_" + i] = {id: lSetups[i]._id, jsFile: lSetups[i].jsFile};
                    $("#" + key + "_delete_" + i).attr('data-id', lSetups[i]._id);
                    $("#" + key + "_hidden_" + i).attr('data-id', lSetups[i]._id);
                    $("#" + key + "_hidden_" + i).prop("checked", lSetups[i].hidden);
                    $("#" + key + "_delete_" + i).on('click', deleteSetup);
                    $("#" + key + "_hidden_" + i).change(hideSetup);
                }
            });
        });
    };

    var deleteSetup = function (e) {
        if (isDeleting == true) {
            return;
        }
        isDeleting = true;
        socket.emit("deleteSetup", {id2delete: buttonMap[e.currentTarget.id].id});
        socket.on("setupDeleteSuccessful", function (data) {
            populateSpaceForSetups();
            isDeleting = false;
        });
    };

    var hideSetup = function (e) {
        var id = $(this).attr('data-id');

        var hide = false;
        if ($(this).is(":checked")) {
            hide = true;
        }
        socket.emit("hideSetup", {id2hide: id, hide: hide});
    };

    $("#submitAddSetup").click(function () {

        //serialise form
        var data = {}
        data.niceName = $("#niceNameFormComponent").val();
        data.author = $("#authorFormComponent").val();
        data.shortDescription = $("#shortDescriptionFormComponent").val();
        data.category = $("#categoryFormComponent option:selected").text();

        data.picture = $("#pictureFormComponent").get(0).files[0].name;
        data.jsFile = $("#jsFileFormComponent").get(0).files[0].name;

        var stream = ss.createStream();
        ss(socket).emit('addSetup', stream, JSON.stringify(data));
        ss.createBlobReadStream($("#pictureFormComponent").get(0).files[0]).pipe(stream);
    });

    //wait for request for js file
    socket.on('addSetupRequestJS', function () {
        numJSRequests += 1;
        if (numJSRequests > 1) {
            return;
        }
        var stream = ss.createStream();
        ss(socket).emit('addSetupJS', stream, {});
        ss.createBlobReadStream($("#jsFileFormComponent").get(0).files[0]).pipe(stream);
    });
    socket.on('invalidStream', function () {
        numJSRequests -= 1;
    });

    socket.on('unauthorized', function () {
        $("#addSetupModal").modal('hide');
        $("#loginModal").modal();
    });

    socket.on('addSetupSuccess', function () {
        numJSRequests -= 1;
        $("#addSetupModal").modal('hide');
        $("#addSetupForm").get(0).reset();
        populateSpaceForSetups();
    });

    $("#addSetupButton").click(function () {
        $("#addSetupModal").modal();
    });

    populateSpaceForSetups();
});