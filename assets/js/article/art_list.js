$(function () {
    var layer = layui.layer
    var form = layui.form
    var laypage = layui.laypage

    // 定义美化时间的过滤器
    template.defaults.imports.dataFormat = function (date) {
        const dt = new Date(date)

        var y = dt.getFullYear()
        var m = padZero(dt.getMonth())
        var d = padZero(dt.getDate())

        var hh = padZero(dt.getHours())
        var mm = padZero(dt.getMinutes())
        var ss = padZero(dt.getSeconds())

        return y + '-' + m + '-' + d + ' ' + hh + ':' + mm + ':' + ss
    }

    // 定义一个补零的函数
    function padZero(n) {
        return n > 9 ? n : '0' + n
    }

    // 定义一个查阅的参数对象,将来请求数据的时候需要将请求参数对象提交到服务器
    var q = {
        pagenum: 1, // 页码值，默认请求第一页的数据
        pagesize: 2, // 每页显示几条数据，默认每页显示2条
        cate_id: '', // 文章分类的 Id
        state: '' // 文章的发布状态
    }


    initTable()
    initCate()

    // 获取文章列表数据的方法
    function initTable() {
        $.ajax({
            method: 'GET',
            url: '/my/article/list',
            data: q,
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('获取文章列表失败！')
                }
                // 使用模板引擎渲染页面的数据
                var htmlStr = template('tpl-table', res)
                $('tbody').html(htmlStr)
                // 调用渲染分页的方法
                renderPage(res.total)
            }
        })
    }

    // 初始化文章分类的方法
    function initCate() {
        $.ajax({
            method: 'GET',
            url: '/my/article/cates',
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('获取文章分类失败！')
                }
                // 调用模板引擎渲染分类的可选项
                var htmlStr = template('tpl-cate', res)
                // console.log(htmlStr);
                $('[name=cate_id]').html(htmlStr)
                // 通知layui重新渲染表单区域的ui结构
                form.render()
            }
        })
    }


    // 为form表单绑定submit事件
    $('#form-search').on('submit', function (e) {
        // 阻止默认提交的行为
        e.preventDefault()
        // 获取表单中选中的选项值
        var cate_id = $('[name=cate_id]').val()
        var state = $('[name=state]').val()
        // 把获取的值赋值给查询参数q
        q.cate_id = cate_id
        q.state = state
        // 根据筛选条件,重新渲染表格数据
        initTable()
    })


    // 定义渲染分页的方法
    function renderPage(total) {
        // console.log(total);
        // 调用渲染分页的laypage.render方法
        laypage.render({
            elem: 'pageBox', // 分页容器的Id  注意:这里id不用加#号
            count: total, //数据总数，从服务端得到
            limit: q.pagesize, // 每页显示的条数
            curr: q.pagenum, // 起始页
            // 自定义排版
            layout: ['count', 'limit', 'prev', 'page', 'next', 'skip'],
            limits: [2, 3, 5, 10],
            // 切换分页时,调用jump函数
            // 1.点击页码会调用jump函数
            // 2.调用laypage.render也会触发jump回调函数
            jump: function (obj, first) {
                // 通过first的值判断是通过哪种方式触发了jump的函数
                // console.log(first);
                // console.log(obj.curr);
                // 将切换分页后的最新页码值赋给查询参数q
                q.pagenum = obj.curr
                // 切换后的每页显示的条目数赋值给查询参数q
                q.pagesize = obj.limit
                if (!first) {
                    // 获取文章列表数据
                    initTable()
                }
            }
        })
    }


    // 通过代理的方式为模板引擎的删除按钮绑定点击事件
    $('tbody').on('click', '.btn-delete', function () {
        // 获取页面上删除按钮的个数
        var len = $('.btn-delete').length
        // 获取文章的id
        var id = $(this).attr('data-id')
        // 询问是否删除?
        layer.confirm('确认删除?', { icon: 3, title: '提示' }, function (index) {
            $.ajax({
                method: 'GET',
                url: '/my/article/delete/' + id,
                success: function (res) {
                    if (res.status !== 0) {
                        return layer.msg('删除失败!')
                    }
                    layer.msg('删除成功!')
                    // 判断删除按钮的个数,若为1则页码数-1
                    if (len === 1) {
                        // 判断页码数是否为1
                        q.pagenum = q.pagenum === 1 ? 1 : q.pagenum - 1
                    }
                    initTable()
                }
            })

            layer.close(index);
        })
    })
})