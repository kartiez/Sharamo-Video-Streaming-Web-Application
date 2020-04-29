var div_root = document.createElement('div')
hide_index = 100

window.onload = function() {
    getDiskSpace()
    get_files()
};

// Delete file
function deleteFile(filename) {
    console.log('Delete file: ', filename)
    if (confirm("Are you sure you want to delete this file?")) {
        data = {
            "filename": filename
        }
        $.ajax({
            url: 'http://192.168.0.26:8000/deletemovie',
            type: 'GET',
            data: data,
            contentType: 'application/json',
            success: result => {
                console.log(result)
                location.reload();
            },
            error: error => {
                console.log(error)
            }
        });
    }
}

// Get disk space
function getDiskSpace() {
    $.ajax({
        url: 'http://192.168.0.26:8000/space',
        type: 'GET',
        contentType: 'application/json',
        success: result => {
            result = result[0]
            percentComplete = (result.Used / result.Total * 100).toFixed(2);
            console.log('percent - ', result)
            if (percentComplete < 50) {
                $('#disk-space').attr('class', 'progress-bar bg-success')
            } else if (percentComplete < 70) {
                $('#disk-space').attr('class', 'progress-bar bg-info')
            } else if (percentComplete < 90) {
                $('#disk-space').attr('class', 'progress-bar bg-danger')
            }
            $('#disk-space').attr('aria-valuenow', percentComplete).css('width', percentComplete + '%').text(percentComplete + '%')
            $('#space-avil').text((result.Free / 1024 / 1024).toFixed(2))
        },
        error: error => {
            console.log(error)
        }
    });
}

// Get files from server
function get_files() {
    $.ajax({
        url: "http://192.168.0.26:8000/show",
        type: 'GET',
        contentType: 'application/json',
        success: function(result) {
            DirectoryRecursion(result).files.forEach(element => {
                if (element.type == 'file') {
                    var div = document.createElement('li')
                    var a = document.createElement('a')
                    var img = document.createElement('img')
                    img.src = "./../static/images/file.png"
                    img.width = '40'
                    a.innerText = element.name
                    a.href = "static/share/" + element.link
                    div.appendChild(img)
                    div.appendChild(a)
                    div.insertAdjacentHTML('beforeend',
                        "<button type='button' onclick=\"deleteFile(" + "'" + element.name + "'" + ") \" class='close' aria-label='Close'><span aria-hidden='true'>&times;</span></button>"
                    );
                    div_root.appendChild(div)
                } else {
                    var div = document.createElement('li')
                    var img = document.createElement('img')
                    img.src = "./../static/images/folder.png"
                    img.width = '45'
                    var span = document.createElement('span')
                    span.innerText = element.name
                    div.appendChild(img)
                    div.appendChild(span)
                    div_root.appendChild(div)
                }
            })
            console.log(div_root)
            document.getElementById('items').appendChild(div_root)
        },
        error: function(error) {
            console.log(error)
        }
    });
    return false
}

function DirectoryRecursion(object) {
    var files = []
    var div_p = document.createElement('div')
    div_p.id = '1'
    object.forEach(element => {
        if (element.subdir.length > 0) {
            var img = document.createElement('img')
            img.src = "./../static/images/folder.png"
            img.width = '45'
            var div_folder = document.createElement('li')
            div_folder.id = hide_index
            hide_index += 1
            div_folder.appendChild(img)
            var span = document.createElement('span')
            span.innerText = element.name
            div_folder.appendChild(span)
            var files_div = document.createElement('ul')
            files_div.id = hide_index
            hide_index += 1
            files_div.className = 'hidden'

            div_folder.onclick = function() {
                find_toggle(this)
            }

            return_from_fn = DirectoryRecursion(element.subdir)
            return_from_fn.files.forEach(file => {
                var div_file = document.createElement('li')
                if (file.type == 'file') {
                    var img = document.createElement('img')
                    img.src = "./../static/images/file.png"
                    img.width = '40'
                    files_div.className = 'hidden'
                    div_file.id = hide_index
                    hide_index += 1
                    var content = document.createElement('a')
                    content.innerText = file.name
                        // content.href = file.link
                    content.href = "static/share/" + file.link
                } else {
                    var img = document.createElement('img')
                    img.src = "./../static/images/folder.png"
                    img.width = '45'
                    var content = document.createElement('span')
                    content.innerText = file.name
                }
                div_file.appendChild(img)
                div_file.appendChild(content)
                div_file.insertAdjacentHTML('beforeend',
                    "<button type='button' onclick=\"deleteFile(" + "'" + file.name + "'" + ") \" class='close' aria-label='Close'><span aria-hidden='true'>&times;</span></button>"
                );
                files_div.appendChild(div_file)
            })
            files_div.appendChild(return_from_fn.html)

            div_folder.setAttribute('onclick', "$('#" + files_div.id + "').show('fast');");

            div_folder.appendChild(files_div)
            div_p.appendChild(div_folder)
        } else {
            files.push({
                'name': element.name,
                'link': element.link,
                'type': element.type
            })
        }
        div_root.appendChild(div_p)
    })
    return {
        'files': files,
        'html': div_p
    }
}

// File Upload
$('.on-upload').hide()
$('#submit').hide()
$('form').change(e => {
    $('#submit').show()
})
$('form').submit(event => {
    event.preventDefault();
    $('.on-upload').show()
    $('#submit').hide()
    var formData = new FormData($('form')[0]);
    var request = $.ajax({
        xhr: function() {
            var xhr = new window.XMLHttpRequest();
            xhr.upload.addEventListener("progress", function(evt) {
                if (evt.lengthComputable) {
                    var percentComplete = evt.loaded / evt.total;
                    percentComplete = parseInt(percentComplete * 100);
                    $('#progress-bar').attr('aria-valuenow', percentComplete).css('width', percentComplete + '%').text(percentComplete + '%')
                }
            }, false);
            return xhr;
        },
        url: 'http://192.168.0.26:8000/file_upload',
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        dataType: "json",
        success: function(result) {
            console.log('File Upload done!');
            location.reload();
            $('.on-upload').hide()
        },
        error: error => {
            console.log(error);
            location.reload();
        }
    });
    $('#cancel').click(() => {
        request.abort();
        $('#progress-bar').attr('aria-valuenow', 0).css('width', '0%').text('0%')
        $('.on-upload').hide()
    })
})