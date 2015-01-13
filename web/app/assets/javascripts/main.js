
function pad(n) {return (n<10 ? '0'+n : n);}

function bytesToSize(bytes) {
   var sizes = ['Bytes', 'KByte', 'MByte', 'GByte', 'TByte'];
   if (bytes == 0) return '0 Bytes';
   var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
   return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
}

function refresh(selector, data_source) {
   var body = $(selector);
   body.html("");
   $.ajax({
      type : 'GET',
      url : data_source,
      success : function(data) {
         for(i=0;i<data.length;i++) {
            var d = data[i];
            var value = '<tr>';

            value += '<td><input type="checkbox" class="multi-checkbox" data-value="'+d['id']+'"></td>';

            if(d['filetype'] == 'folder') {
               value += '<td class="folder-col"><a href="'+jsRoutes.controllers.Filesystem.cwd(d['id']).url+'">'+d['filename']+'</a></td>';
            } else {
               value += '<td class="file-col"><a href="'+jsRoutes.controllers.Filesystem.download(d['id']).url+'">'+d['filename']+'</a></td>';
            }
            var date = new Date(d['createDate']);
            value += "<td>"+pad(date.getDate())+"."+pad(date.getMonth()+1)+"."+date.getFullYear()+" "+pad(date.getHours())+":"+pad(date.getMinutes())+" Uhr</td>"
            if(d['filetype'] == 'folder') {
               value += '<td><i class="fa fa-folder"></i></td>';
            } else {
               value += '<td><i class="fa fa-file"></i> '+bytesToSize(d['size'])+'</td>';
            }
            value += '<td>'+d['service']+'</td>';
            value += '<td><a href="'+jsRoutes.controllers.Filesystem.deleteFile(d['id']).url+'" title="löschen"><span class="fa fa-remove"></span></a></td>';

            value += '</tr>';
            body.append(value);
         }

         if(data.length == 0) {
            body.append("<tr><td colspan=\"6\"><div class='loader'><span class=\"text-muted\">Keine Dateien vorhanden</span></div></td></tr>");
         }

      },
      error : function(data) {
         body.html("<tr><td colspan=\"6\"><div class='loader'><span class=\"text-muted\">Fehler beim Laden der Dateiliste</span></div></td></tr>");
      }
   });
}

function refreshNews(selector, data_source) {
   var body = $(selector);
   body.html("");
   $.ajax({
      type : 'GET',
      url : data_source,
      success : function(data) {
         for(i=0;i<data.length;i++) {
            var d = data[i];
            var value = '<tr>';

            value += '<td><input type="checkbox" class="multi-checkbox" data-value="'+d['id']+'"></td>';
            value += "<td>"+d['name']+"</td>";
            value += "<td>"+d['text']+"</td>";
            var date = new Date(d['date']);
            value += "<td>"+pad(date.getDate())+"."+pad(date.getMonth()+1)+"."+date.getFullYear()+" "+pad(date.getHours())+":"+pad(date.getMinutes())+" Uhr</td>"
            value += '<td><a href="'+jsRoutes.controllers.News.rm(d['id']).url+'" title="\''+d['name']+'\' löschen"><span class="fa fa-remove"></span></a></td>';

            value += '</tr>';
            body.append(value);
         }

         if(data.length == 0) {
            body.append("<tr><td colspan=\"6\"><div class='loader'><span class=\"text-muted\">Keine News vorhanden</span></div></td></tr>");
         }

      },
      error : function(data) {
         body.html("<tr><td colspan=\"6\"><div class='loader'><span class=\"text-muted\">Fehler beim Laden der News</span></div></td></tr>");
      }
   });
}

$(function() {

   $('input[type=checkbox].multi-checkbox.master').on('click', function() {
      var isChecked = $(this).prop('checked');
      $('input[type=checkbox].multi-checkbox:not(.master)').each(function() {
         $(this).prop('checked', isChecked);
      });
   });

   $('.modal-action').on('click', function() {
      $.ajax({
         type : 'GET',
         url : $(this).attr('data-requesturl'),
         success : function(data) {
            $(".modal-content").html(data['body']);
         },
         error : function(data) {
            alert("failed");
         }
      });
      $('#myModal').modal();
   });

   $('.input-group.password .glyphicon-eye-open').on('click', function () {

      var child = $(this).parent().find('input.form-control');

      if(child.attr('type') == 'password') {
         child.attr('type', 'text');
         $(this).removeClass('glyphicon-eye-open');
         $(this).addClass('glyphicon-eye-close');
      } else {
         child.attr('type', 'password');
         $(this).removeClass('glyphicon-eye-close');
         $(this).addClass('glyphicon-eye-open');
      }
   });


   $('.panel-heading').on('click', function() {
      $(this).parent().find(".panel-body").fadeToggle();
   });

   var WS = WS2 = window['MozWebSocket'] ? MozWebSocket : WebSocket;

   var newsSocket = new WS("ws://"+window.location.host+"/news/updates");
   var nreceiveEvent = function(event) {
      var news = JSON.parse(event.data);
      var body = $('.panel-body.news');
      body.html("");
      for(i=0;i<news.length;i++) {
         var date = new Date(news[i]['date']);
         body.append('<p><span class="text-muted">Am '+pad(date.getDate())+"."+pad(date.getMonth()+1)+"."+date.getFullYear()+" um "+pad(date.getHours())+":"+pad(date.getMinutes())+' Uhr von '+news[i]['owner']+'</span>: <strong>['+news[i]['name']+']</strong> '+news[i]['text']+'</p>');
      }
      //wenn keine Daten vorhanden sind
      if(news.length == 0) {
         body.html('<div class="loader text-muted">Aktuell sind keine Daten vorhanden</div>')
      }
   };
   newsSocket.onmessage = nreceiveEvent;

   var filesocket = new WS2("ws://"+window.location.host+"/files/updates");
   var freceiveEvent = function(event) {
      var files = JSON.parse(event.data);
      var body = $('.panel-body.files tbody');
      body.html("");
      for(i=0;i<files.length;i++) {
         var date = new Date(files[i]['createDate']);
         var val = "<tr>"+
                   "<td>"+pad(date.getDate())+"."+pad(date.getMonth()+1)+"."+date.getFullYear()+" "+pad(date.getHours())+":"+pad(date.getMinutes())+" Uhr</td>" +
                   "<td>"+files[i]['filename']+"</td>" +
                   "<td>"+bytesToSize(files[i]['size'])+"</td>" +
                   "<td>"+files[i]['service']+"</td>" +
                   "</tr>";
         body.append(val);
      }
      //wenn keine Daten vorhanden sind
      if(files.length == 0) {
         body.html('<tr><td colspan="4" class="loader text-muted">Aktuell sind keine Daten vorhanden</td></tr>')
      }
   };
   filesocket.onmessage = freceiveEvent;

   //Initiales laden der Tabellen
   refresh(".table.filesystem tbody", jsRoutes.controllers.Filesystem.jsonFilesList().url);
   refreshNews(".table.news tbody", jsRoutes.controllers.News.jsonNewsList().url);

   var info = $('#storage-info');
   info.html("Du verbrauchst aktuell <strong>"+bytesToSize(info.attr('data-used'))+' (ca. '+info.attr('data-percent')+'%)</strong> von deinen verfügbaren <strong>'+bytesToSize(info.attr('data-available'))+'</strong>');

});

