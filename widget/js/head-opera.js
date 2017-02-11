Vue.component('head-opera', {
    template: '<p class="item-list">' +
                '<template v-for="item in items">' +
                    '<template v-if="!item.right">' +
                        '<template v-if="!item.authUrl||item.authUrl&&authVeri(item.authUrl)">' +
                            '<a href="javascript:;" class="item-btn item-btn1" v-on:click="operafun($index)" :disabled="item.disabled==null"><i class="{{icons[$index]}}"></i>{{item.name}}</a>' +
                            '<template v-if="$index!=items.length">' +
                                '<span class="vertical"></span>' +
                            '</template>' +
                        '</template>' +
                    '</template>' +
                    '<template v-else>' +
                        '<template v-if="!item.authUrl||item.authUrl&&authVeri(item.authUrl)">' +
                            '<a href="javascript:;" class="item-btn item-btn1 item-btn-right" v-on:click="operafun($index)" :disabled="item.disabled==null"><i class="{{icons[$index]}}"></i>{{item.name}}</a>' +
                            '<template v-if="$index!=items.length">' +
                                '<span class="vertical vertical-right"></span>' +
                            '</template>' +
                        '</template>' +
                    '</template>' +
                '</template>' +
            '</p>',
    props: ['items','rightItems'],//name,opera
    data: function () {
        return {
            icons: [],
            auth: []
        }
    },
    ready: function () {
        var iconData = [
            {
                name: '保存',
                icon: 'icon-save'
            },
            {
                name: '门店合同',
                icon: 'icon-file-alt'
            },
            {
                name: '装修',
                icon: 'icon-magic'
            },
            {
                name: '图片',
                icon: 'icon-picture'
            },
            {
                name: '查看',
                icon: 'icon-eye-open'
            },
            {
                name: '导出',
                icon: 'icon-download-alt'
            },
            {
                name: '下载',
                icon: 'icon-download-alt'
            },
            {
                name: '导入',
                icon: 'icon-upload-alt'
            },
            {
                name: '新增',
                icon: 'icon-plus'
            },
            {
                name: '删除',
                icon: 'icon-minus'
            },
            {
                name: '编辑',
                icon: 'icon-pencil'
            },
            {
                name: '同步',
                icon: 'icon-exchange'
            },
            {
                name: '不显示',
                icon: 'icon-eye-close'
            },
            {
                name: '显示',
                icon: 'icon-eye-open'
            },
            {
                name: '启用',
                icon: 'icon-ok'
            },
            {
                name: '禁用',
                icon: 'icon-remove'
            },
        ];
        var icon = [];
        for (var i = 0; i < this.items.length; i++) {
            for (var m = 0; m < iconData.length; m++) {
                if (this.items[i].name.indexOf(iconData[m].name) != -1) {
                    icon.push(iconData[m].icon);
                    break;
                }
                if (m == iconData.length - 1) {
                    icon.push('');
                }
            }
        }
        this.icons = icon;
        // var authUrlList = sessionStorage.authList;
        // for (var m = 0; m < this.items.length;i++)
        // {
        //     if(this.items.authUrl)
        //     {
        //         for(var n = 0; n<icons.length;n++)
        //         {
        //             if(this.items[m].authUrl == icons[n])
        //             {
        //                 this.items[m].authUrl = false;
        //             }
        //         }
        //     }
        // }
    },
    methods: {
        operafun: function (index) {
            this.items[index].operaFun();
        },
        operafunRight: function (index) {
            this.rightItems[index].operaFun();
        },
        //权限验证
        authVeri: function(url){
            var auth = JSON.parse(sessionStorage.authData);
            if(!auth) return false;
            for (var i = 0 ; i < auth.length; i++)
            {
                if(url==auth[i])
                {
                    return true
                }
            }
            return false;

        }
        
    },
    computed: {
        //生成图标
        // icons: {
        //     get: function () {

        //         return icon

        //     }
        // }
    }
});