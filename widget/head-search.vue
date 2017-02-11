<template>
    <div class="item-search">
        <form>
            <template v-for="item in form">
                <template v-if="item.type=='text'||item.type=='number'||item.type=='file'||item.type=='password'">
                    <div :class="['form-group',item.required&&'required']">
                        <label>{{item.name}}</label>
                        <input type="{{item.type}}" id="{{item.id}}" name="{{item.field}}" class="form-control" accept="{{item.accept}}" checked="{{item.checked}}"
                            v-model="formData[item.field]" max="{{item.max}}" min="{{item.min}}" maxlength="{{item.maxlength}}"
                            maxlength="item.id" multiple="{{item.multiple}}" v-on:click="item.operaFun&&inputOpera(item.operaFun)">
                    </div>
                </template>
                <template v-if="item.type=='date'">
                    <div :class="['form-group','form-group-date',item.required&&'required']">
                        <label>{{item.name}}</label>
                        <input type="text" id="{{item.id}}" name="{{item.field}}" lazy class="form-control" v-model="formData[item.field]">
                    </div>
                </template>
                <template v-if="item.type=='radio'">
                    <div :class="['form-group','form-group-long',item.required&&'required']">
                        <label>{{item.name}}</label>
                        <template v-for="item2 in item.radio">
                            <span class="form-chose">
                                            <input type="radio" name="{{item2.field}}" id="{{item2.id}}" value="{{item2.value}}" v-model="formData[item.field]">
                                            <label for="{{item2.field}}">{{item2.name}}</label>
                                        </span>
                        </template>
                    </div>
                </template>
                <template v-if="item.type=='checkbox'">
                    <div :class="['form-group','form-group-long',item.required&&'required']">
                        <label>{{item.name}}</label>
                        <template v-for="item2 in item.checkbox">
                            <span class="form-chose">
                    
                                            <input type="checkbox" name="{{item2.id}}" id="{{item2.id}}" value="{{item2.value}}" v-model="formData[item.field]" :disabled="item2.disabled">
                                            <label for="{{item2.id}}">{{item2.name}}</label>
                                        </span>
                        </template>
                    </div>
                </template>
                <template v-if="item.type=='select'">
                    <div :class="['form-group',item.required&&'required']">
                        <label>{{item.name}}</label>
                        <select-stand :info-type="item.select.infoTypes" :type="item.select.types" :readonly="readonly" :auto-chose="item.field"
                            :localdata="item.select.localdata" :url="item.select.url" :after-chose="item.select.afterChose" :before-chose="item.select.beforeChose"
                            :custom-field="item.select.customField" :spread-event="item.select.spreadEvent" :paras="item.select.paras"
                            :link-field="item.select.linkField">
                        </select-stand>
                    </div>
                </template>
            </template>
            <form>
                <br>
                <a href="javascript:;" class="btn btn-search" v-on:click="search">查询</a>
                <a href="javascript:;" class="btn btn-undo" v-on:click="revoke">
                    <i class="icon-undo"></i>
                    <span>撤销</span>
                </a>
    </div>
</template>

<script>
    module.exports = {
        props: ['form', 'searchFun', 'revokeFun', 'readyFun'],
        data: function () {
            return {
                formData: {},
                selectGroup: []
            }
        },
        ready: function () {
            if (this.form) {
                for (var i = 0; i < this.form.length; i++) {
                    if (!this.form[i].defaultValue) {
                        Vue.set(this.formData, this.form[i].field, '');
                    }
                    else {
                        Vue.set(this.formData, this.form[i].field, this.form[i].defaultValue);
                    }
                    if (this.form[i].type == 'select') {
                        this.selectGroup.push(i)
                    }
                    else if (this.form[i].type == 'date') {
                        // laydate(this.form[i].date);
                        $('#' + this.form[i].id).datetimepicker(this.form[i].date);
                    }
                }
            }
            this.readyFun && this.readyFun();
            // this.$parent.$broadcast('headSearchReady');
        },
        methods: {
            blur: function () {
                // var self = this;
                // setTimeout(function () { 
                //     for(var m in self.form)
                //     { 
                //         if(self.form[m].type=='date')
                //         {
                //             self.formData[self.form[m].field] = document.querySelector('#'+self.form[m].id).value;
                //         }
                //     }
                //  },100)
            },
            //搜索
            search: function () {
                this.getFormData();
                this.searchFun && this.searchFun(this.formData);
            },
            getFormData: function () {
                var forms = this.$el.querySelector('form');
                var newFormData = new FormData(forms);
                for (var i = 0; i < this.selectGroup.length; i++) {
                    this.formData[this.form[this.selectGroup[i]].field] = this.$children[i].val();
                }
                for (m in this.formData) {
                    this.formData[m] = htmlEncode(this.formData[m])
                }
                return this.formData
            },
            //撤销
            revoke: function () {
                var formAll = this.$el.querySelectorAll('input');
                for (var i = 0; i < formAll.length; i++) {
                    formAll[i].value = '';
                }
                var children = this.$children;
                for (var m in this.formData) {
                    this.formData[m] = ''
                }
                this.$broadcast('clear');
                this.revokeFun && this.revokeFun();
            },
            //高级搜索
            advanced: function () {

            }
        }
    }
</script>
<style>
    
</style>