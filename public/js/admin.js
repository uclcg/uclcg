/*! uclcg 2021-09-27 */

$(document).ready(function(){var e=io(),t=[],a=!1,d=0,n=function(){e.emit("getAllSetups",{}),e.on("returnAllSetups",function(e){console.log("In ADMIN.JS -- this shoudldnt happen!");for(var a=JSON.parse(e),d=0;d<a.length;++d)""==a[d].category&&(a[d].category="Default");var n=$("#spaceForSetups");n.empty(),tabbedSetups=[];for(var s="",p=0;p<a.length;++p)0==p&&(s=a[p].category),tabbedSetups[a[p].category]||(tabbedSetups[a[p].category]=[]),tabbedSetups[a[p].category].push(a[p]);t=[],n.append('<ul id="setupTabs" class="nav nav-tabs"></ul>'),n.append('<div id="setupTabsContent" class="tab-content"></div>'),Object.keys(tabbedSetups).forEach(function(e){var a=tabbedSetups[e],d=e==s;d?$("#setupTabs").append('<li class="active" id="tab_'+e+'"><a data-toggle="tab" href="#'+e+'">'+e+"</a></li>"):$("#setupTabs").append('<li id="tab_'+e+'"><a data-toggle="tab" href="#'+e+'">'+e+"</a></li>"),d?$("#setupTabsContent").append('<div id="'+e+'" class="tab-pane fade in active"></div>'):$("#setupTabsContent").append('<div id="'+e+'" class="tab-pane fade"></div>'),$("#"+e).append('<div id="setupRow-'+e+'"class="row display-flex"></div>');for(var n=0;n<a.length;++n){var p=$("#setupRow-"+e),l=a[n].picture,c=a[n].picture.lastIndexOf("/");p.append('<div class="col-xs-12 col-sm-6 col-md-4 col-lg-3">\n                                        <div class=" thumbnail">\n                                            <a id="'+e+"_load_"+n+'" href="#" class="loadButton">\n                                            <img src="'+l.substring(0,c+1)+l.substring(c+1)+'" alt="...">\n                                            </a>\n                                            <div class="caption">\n                                                <h3>'+a[n].niceName+"</h3>\n                                                <p>"+a[n].shortDescription+'</p>\n                                                <p><a id="'+e+"_delete_"+n+'" href="#" class="deleteButton btn btn-primary" role="button">Delete</a></p>\n                                                <p><label style="cursor:pointer"><input id="'+e+"_hidden_"+n+'" type="checkbox" class="hideCheckbox" name="hidden"/> Hidden </label></p>\n                                            </div>\n                                        </div>\n                                      </div>'),t[e+"_delete_"+n]={id:a[n]._id,jsFile:a[n].jsFile},$("#"+e+"_delete_"+n).attr("data-id",a[n]._id),$("#"+e+"_hidden_"+n).attr("data-id",a[n]._id),$("#"+e+"_hidden_"+n).prop("checked",a[n].hidden),$("#"+e+"_delete_"+n).on("click",i),$("#"+e+"_hidden_"+n).change(o)}})})},i=function(d){1!=a&&(a=!0,e.emit("deleteSetup",{id2delete:t[d.currentTarget.id].id}),e.on("setupDeleteSuccessful",function(e){n(),a=!1}))},o=function(t){var a=$(this).attr("data-id"),d=!1;$(this).is(":checked")&&(d=!0),e.emit("hideSetup",{id2hide:a,hide:d})};$("#submitAddSetup").click(function(){var t={};t.niceName=$("#niceNameFormComponent").val(),t.author=$("#authorFormComponent").val(),t.shortDescription=$("#shortDescriptionFormComponent").val(),t.category=$("#categoryFormComponent option:selected").text(),t.picture=$("#pictureFormComponent").get(0).files[0].name,t.jsFile=$("#jsFileFormComponent").get(0).files[0].name;var a=ss.createStream();ss(e).emit("addSetup",a,JSON.stringify(t)),ss.createBlobReadStream($("#pictureFormComponent").get(0).files[0]).pipe(a)}),e.on("addSetupRequestJS",function(){if(!((d+=1)>1)){var t=ss.createStream();ss(e).emit("addSetupJS",t,{}),ss.createBlobReadStream($("#jsFileFormComponent").get(0).files[0]).pipe(t)}}),e.on("invalidStream",function(){d-=1}),e.on("unauthorized",function(){$("#addSetupModal").modal("hide"),$("#loginModal").modal()}),e.on("addSetupSuccess",function(){d-=1,$("#addSetupModal").modal("hide"),$("#addSetupForm").get(0).reset(),n()}),$("#addSetupButton").click(function(){$("#addSetupModal").modal()}),n()});