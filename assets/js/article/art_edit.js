$(function () {
    // 通过 URLSearchParams 对象，获取 URL 传递过来的参数
    var params = new URLSearchParams(location.search)
    console.log(params);

    var artId = params.get('id')
    console.log(artId);

    // 文章的发布状态
    var pubState = ''

    // 获取需要的 layui 对象
    var form = layui.form

    // 1. 渲染文章分类列表
    initCate()

    function initCate() {
        $.get('/my/article/cates', function (res) {
            if (res.status !== 0) {
                return layer.msg('获取文章分类列表失败！')
            }
            var htmlStr = template('tpl-cate', res)
            $('[name=cate_id]').html(htmlStr)
            form.render()
            getArticleById()
        })
    }

    // 2. 根据文章的 Id，获取文章的详情，并初始化表单的数据内容
    function getArticleById() {
        // 发起请求，获取文章详情
        // console.log(artId);

        $.get('/my/article/' + artId, function (res) {
            // 获取数据失败
            if (res.status !== 0) {
                return layer.msg('获取文章失败！')
            }
            // 获取数据成功
            var art = res.data
            // 为 form 表单赋初始值
            // console.log(art);

            form.val('addform-data', {
                Id: art.Id,
                title: art.title,
                cate_id: art.cate_id,
                content: art.content
            })

            // 手动初始化富文本编辑器
            initEditor()

            // 初始化图片裁剪器
            var $image = $('#image')

            // $('#image').attr('src', 'http://ajax.frontend.itheima.net' + art.cover_img)
            $image.attr('src', 'http://www.liulongbin.top:3007' + art.cover_img)

            // 裁剪选项
            var cropperOption = {
                aspectRatio: 400 / 280,
                preview: '.img-preview',
                // 初始化图片裁剪框的大小
                autoCropArea: 1
            }
            // 初始化裁剪区域
            $image.cropper(cropperOption)
        })
    }

    // 3. 选择封面
    $('#btn-image').on('click', function (e) {
        e.preventDefault()
        $('#imgUpload').click()
    })

    // 4. 监听文件选择框的 change 事件
    $('#imgUpload').on('change', function (e) {
        var files = e.target.files
        // 没有选择文件
        if (files.length === 0) {
            return
        }
        // 重新为裁剪区域设置图片
        $('#image')
            .cropper('destroy')
            .attr('src', URL.createObjectURL(files[0]))
            .cropper({
                aspectRatio: 400 / 280,
                preview: '.img-preview'
            })
    })

    // 设置文章的发布状态
    $('#btn-Pub').on('click', function () {
        pubState = '已发布'
    })
    $('#btn-Cg').on('click', function () {
        pubState = '草稿'
    })

    // 5. 发布文章
    $('#form-data').on('submit', function (e) {
        e.preventDefault()

        $('#image')
            .cropper('getCroppedCanvas', {
                width: 400,
                height: 280
            })
            .toBlob(function (blob) {
                // 5.1 组织参数对象
                var fd = new FormData($('#form-data')[0])
                // console.log(fd);

                // 5.2 添加封面
                fd.append('cover_img', blob)
                // 5.3 添加文章的发表状态
                fd.append('state', pubState)
                // 5.4 发起请求
                $.ajax({
                    method: 'POST',
                    url: '/my/article/edit',
                    data: fd,
                    contentType: false,
                    processData: false,
                    success: function (res) {
                        if (res.status !== 0) {
                            return layer.msg('编辑文章失败!')
                        }
                        location.href = '/article/art_list.html'
                    }
                })
            })
    })
})