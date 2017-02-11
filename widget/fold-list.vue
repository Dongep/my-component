<template>
    <div class="fold-list">
        <p class="fold-list-head">
            <span></span>
            <span v-for="item in head">{{item.name}}</span>
            <span>操作</span>
        </p>
        <div class="fold-list-main scroll-stand">
            <ul v-bind:class="{'role-open':item.childrenList}" v-for="item in list" order="{{$index}}">
                <fold-list-main :item="item" :head="head" :opera="opera" :mark="mark" :top-delete="topDelete"></fold-list-main>
            </ul>
        </div>

        <div class="loding-con" style="display:none">
            <p class="loding"><span></span><span></span><span></span><span></span><span></span><span></span></p>
        </div>
    </div>
</template>

<script>
    module.exports = {
        props: ['url', 'head', 'must', 'opera', 'itemClick', 'viewFun', 'mark', 'topDelete'],
        data: function () {
            return {
                list: '',
                fid: '',
                numCount: true,
                lastActiveLi: ''
            }
        },
        ready: function () {
            var self = this;
            if (self.url) {
                self.$el.querySelector('.loding-con').style.display = 'block';
                $.ajax({
                    url: self.url,
                    type: "GET",
                    dataType: "JSON",
                    success: function (data) {
                        self.list = data;
                        self.$el.querySelector('.loding-con').style.display = 'none';
                    },
                    error: function () {
                        if (self.$el.querySelector('.loding-con')) {
                            self.$el.querySelector('.loding-con').style.display = 'none';
                        }
                    }
                });
            }

            //监听所有click事件
            this.$el.addEventListener('click', function (e) {
                var fids;
                var targetData;
                if (e.target.tagName == 'A') {
                    fids = e.target.parentNode.parentNode.getAttribute('fid');
                    self.fid = fids;
                    targetData = self.searchData(self.list, fids);
                    if (e.target.innerHTML == '查看') {
                        self.viewFun(targetData);
                    }
                    else {
                        for (var i = 0; i < self.opera.length; i++) {
                            if (e.target.innerHTML == self.opera[i].name) {
                                self.opera[i].operaFun(targetData);
                            }
                        }

                    }
                    self.active(e);


                }
                else if (e.target.tagName == 'SPAN' && e.target != e.target.parentNode.getElementsByTagName('span')[0]) {
                    fids = e.target.parentNode.getAttribute('fid');
                    self.fid = fids;
                    targetData = self.searchData(self.list, fids);
                    if (e.target.parentNode.tagName == 'LI') {
                        //点击本栏
                        self.itemClick && self.itemClick(targetData);
                    }
                    self.active(e);
                };



            }, false)
        },
        methods: {
            findParent: function (child, parent) {
                var ulp = child, num = 0;
                while (ulp.tagName != parent && num < 10) {
                    ulp = ulp.parentNode;
                    num++;
                };
                return ulp;
            },
            active: function (e) {
                var li = this.findParent(e.target, 'LI');
                if (self.lastActiveLi) {
                    self.lastActiveLi.className = '';
                }

                li.className = 'active';
                self.lastActiveLi = li;
            },
            setData: function (listData, numCount2) {
                this.list = listData;
                this.$el.querySelector('.loding-con').style.display = 'none';

            },
            searchData: function (datas, fids) {
                var success = false, target = null;
                var deep = 0;
                var circu;
                if (!this.mark) {
                    circu = function (dataSin, fidCp) {
                        deep++;
                        if (deep < 10) {
                            for (var i = 0; i < dataSin.length; i++) {
                                if (fidCp == dataSin[i].fid) {
                                    over = dataSin[i];
                                    success = true;
                                    target = dataSin[i];
                                    return
                                }
                                else if (dataSin[i].childrenList.length > 0) {
                                    // path[deep] = i;
                                    circu(dataSin[i].childrenList, fidCp);
                                }
                                if (success) return
                            }
                        }
                        deep--;
                    };
                }
                else {
                    circu = function (dataSin, fidCp) {
                        deep++;
                        if (deep < 10) {
                            for (var i = 0; i < dataSin.length; i++) {
                                if (fidCp == dataSin[i][this.mark]) {
                                    over = dataSin[i];
                                    success = true;
                                    target = dataSin[i];
                                    return
                                }
                                else if (dataSin[i].childrenList.length > 0) {
                                    // path[deep] = i;
                                    circu(dataSin[i].childrenList, fidCp);
                                }
                                if (success) return
                            }
                        }
                        deep--;
                    };

                }
                circu(datas, fids);
                return target;
            },
            refresh: function () {
                var self = this;
                if (self.url) {
                    $.ajax({
                        url: self.url,
                        type: "GET",
                        dataType: "JSON",
                        success: function (data) {
                            self.list = data;
                        }
                    });
                }
            }
        }

    };
</script>  
