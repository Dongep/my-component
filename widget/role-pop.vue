<template>
    <ul v-bind:class="{'role-open':item.childrenList}" v-for="item in items" order={{$index}}>
                <li fid="{{item.fid}}">
                    <span v-on:click.stop="switch" v-bind:style="{paddingLeft: pl + 'px'}">
                        <template v-if="item.childrenList.length>0">
                            <a href="javascript:;" class="switchul"><i class="icon-angle-right"></i></a>
                        </template>
                    </span>
                    <span v-bind:style="{paddingLeft: pl + 'px'}">
                        <input type="checkbox" id="{{'cb'item.fid}}" fid="{{item.fid}}" namerole="{{item.froleName}}" v-bind:checked="item.checked"/>
                        <label for="{{'cb'item.fid}}">
                        {{item.froleName}}
                        </label>
                    </span>
                </li>
                <template v-if="item.childrenList.length>0">
                    <li>
                    <role-pop :items=" item.childrenList" :padding="padding+1"></role-pop>
                    </li>
                </template>
            </ul>
</template>

<script>
module.exports = {
    props: ['items', 'padding'],
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

        },
        val: function (){

        }
    },
    computed: {
        pl: {
            get: function () {
                return this.padding * 13
            }
        }
    }
}
</script>
<style>
    
</style>
