<template>
    <li fid={{item.fid}}>
        <span v-on:click.stop="switch">
            <a href="javascript:;" class="switchul" v-on:click.stop="switch"><i class="icon-angle-right"></i></a>
        </span>
        <template v-for="headItem in head">
            <template v-if="typeof headItem.getter == \'undefined\'">
                <span>{{item[headItem.field]}}</span>
            </template>
            <template v-else>
                <span>{{headItem.getter(item[headItem.field])}}</span>
            </template>
        </template>
        <span fid="{{item.fid}}">
            <a href="javascript:;">查看</a>
            <template v-if="topDelete">
                <template v-for="item2 in opera">
                    <i class="vertical"></i>
                    <a href="javascript:;" >{{item2.name}}</a>
                </template>
            </template>
        </span>
    </li>
    <li v-for="item2 in item.childrenList" fid={{item2.fid}}>
        <template v-if="item2.childrenList.length>0">
            <ul v-bind:class="{\'role-open\':true}" order={{$index}}>
                <fold-list-main :item="item2" :head="head" :opera="opera" :mark="mark" :top-delete="true"></fold-list-main>
            </ul>
        </template>
        <template v-else>
            <span></span>
            <span v-for="headItem in head">{{item2[headItem.field]}}</span>
            <span>
                <a href="javascript:;">查看</a>
                <template v-for="item2 in opera">
                    <i class="vertical"></i>
                    <a href="javascript:;" >{{item2.name}}</a>
                </template>
            </span>
        </template>
    </li>
</template>
<script>
    module.exports = {
        //数据和左填充
        props: ['item', 'head', 'opera', 'mark', 'topDelete'],
        data: function () {
            return {
            }
        },
        methods: {
            //寻找父元素
            findParent: function (child, parent) {
                var ulp = child, num = 0;
                while (ulp.tagName != parent && num < 10) {
                    ulp = ulp.parentNode;
                    num++;
                };
                return ulp;
            },
            //折叠功能
            switch: function (e) {
                var ulp = this.findParent(e.target, 'UL');
                var lihei = ulp.getElementsByTagName('li');
                if (ulp.className == 'role-open') {
                    ulp.className = 'role-close';
                    ulp.style.height = lihei[0].offsetHeight + 'px';
                }
                else if (ulp.className == 'role-close') {
                    ulp.className = 'role-open';
                    ulp.style.height = 'auto';
                }
            }
        }
    }
</script>
<style>
    
</style>