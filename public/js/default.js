/*global  jPlayerPlaylist: false, jQuery:false */

//(function($, undefined) {
//    'use strict';

    var myPlaylist;

    /**
     * Transform an integer from 0 to 100 to a leading 0 number with up to two digits.
     *
     * @param num Number to be transformed.
     * @return Returns the two digit leading 0 number.
     */
    function twoDigit(num) {
        var str = '';
        if(num < 10) {
            str += '0';
        }

        return str + num;
    }

    /**
     * Put number of seconds into HH:MM:SS format when time is more than or equals to 3600 (one hour) or MM:SS, otherwise.
     *
     * @param time Time, in seconds.
     * @return Returns a string represening time in HH:MM:SS or MM:SS format.
     */
    function secondsToHMS(time) {
        var h = 0;
        var m = 0;
        var s = 0;

        h = Math.floor(time / 3600);
        time -= 3600 * h;
        m = Math.floor(time / 60);
        time -= 60 * m;
        s = time;

        var str = '';

        if(h > 0) {
            str = twoDigit(h);
        }

        str += twoDigit(m) + ':';
        str += twoDigit(s);

        return str;
    }

    function cleanTable() {
        var thead = '<thead><tr class="topic"><th>Cover</th><th>Duration</th><th>Title</th><th>Options</th></tr></thead>';
        var tbody = '<tbody></tbody>';
        $('#result').html('<table>' + thead + tbody + '</table>');
    }

    function appendTable(img, title, url, duration) {
        img = '<img class="cover" src="' + img + '" alt="' + title + '"/>';
        var options = '<a href="' + url + '" class="addplaylist" title="' + title + '"><img alt="playlist" src="/img/playlist.gif"/></a>';
        options += '<a href="' + url + '" class="download" title="' + title + '" target="_blank"><img alt="download" src="/img/download.gif"/></a>';
        var tr = '<tr><td>' + img + '</td><td>' + secondsToHMS(duration) + '</td><td><p>' + title + '</p></td><td>' + options + '</td><td>' + '</tr>';
        $('#result table tbody').append(tr);
    }

    function message(text) {
        $('.message div').html(text);
        $('.message').css('opacity', '1');
        $('.message').css('filter', 'alpha(opacity=100)');
    }

    function messageOff() {
        $('.message').css('opacity', '0');
        $('.message').css('filter', 'alpha(opacity=0)');
    }

    function savePlaylist() {
        $.post('/playlist/save', {
            playlist: myPlaylist.original
        }, function(data) {
        });
    }

    function loadPlaylist() {
        $.post('/playlist/load', {}, function(data) {
            $.each(data, function(i, v) {
                myPlaylist.add({title: v.title, mp3: v.mp3});
            });
        }, 'json');
    }

    $(document).ready(function() {
        // query youtube for videos and fill the result table.
        $('#search').ajaxForm({
            dataType: 'json',
            success: function (data) {
                messageOff();
                cleanTable();
                $.each(data, function(i, v) {
                    appendTable(v.pic, v.title, v.you2better, v.duration);
                });
            },
            beforeSubmit: function() {
                message('Loading...');
            }
        });

        // add track into the playlist.
        $('.addplaylist').live('click', function(e) {
            e.preventDefault();
            myPlaylist.add({
                title: $(this).attr('title'),
                mp3: $(this).attr('href')
            });

            savePlaylist();
        });

        $('.jp-playlist-item-remove').live('click', function(e) {
            setTimeout('savePlaylist();', 1500);
        });

        // placeholder on the search input.
        $('#q').placeholder();
        // autocomplete the search input from last.fm.
        $('#q').autocomplete('/api/autocomplete', {
            dateType: 'json',
            parse: function(data) {
                data = $.parseJSON(data);
                return $.map(data, function(row) {
                    return {
                        data: row,
                        value: '<img src="' + row.pic + '"/> <span>' + row.name + '</span>',
                        result: row.name
                    };
                });

            },
            formatItem: function(row, i, n) {
                return '<img src="' + row.pic + '"/> <span>' + row.name + '</span>';
            }
        });

        // submit a query to youtube after change the value of the search input.
        $('#q').change(function() {
            $('#search').submit();
        });

        // start the jplayer.
        var jplayerCss = "#jp_container_1";
        myPlaylist = new jPlayerPlaylist({
            jPlayer: "#jquery_jplayer_1",
            cssSelectorAncestor: jplayerCss
        }, [], {supplied: 'mp3', swfPath: "/obj/", free: true});

        $(jplayerCss + ' ul:last').sortable({
            update: function() {
                myPlaylist.scan();
                savePlaylist();
            }
        });

        // For some reason, i can call loadPlaylist right the way, it must wait for some initialization stuff.
        setTimeout('loadPlaylist();', 1500);
    });
//})(jQuery);