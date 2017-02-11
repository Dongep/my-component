<template>
    <div :class="['content-right',twoColumn&&'content-right-wider',opeType=='view'&&'content-view']">
        <div class="class-cr clearfix">
            <slot name="title">
                <a class="item-btn hover">
                    <i class="icon-pencil"></i>
                    <span class="operName1">{{autoTitle}}</span>
                </a>
                <p class="item-list2">
                    <template v-if="customOpera">
                        <template v-for="item in customOpera">
                            <a href="javascript:;" class="item-btn" v-on:click="item.operaFun()">{{item.name}}</a>
                        </template>
                        <a href="javascript:;" class="item-btn item-btn2" v-on:click="close()"><i class="icon-remove"></i>关闭</a>
                    </template>
                    <template v-else>
                        <a href="javascript:;" class="item-btn item-btn1" v-on:click="saveMess()" v-show="opeType!='view'"><i class=" icon-ok"></i>保存</a>
                        <a href="javascript:;" class="item-btn item-btn2" v-on:click="close()"><i class="icon-remove"></i>关闭</a>
                    </template>
                </p>
            </slot>
        </div>
        <div class="content-con">
            <form v-el:form>
                <div class="form-block">
                    <template v-if="form.title">
                        <p class="title-switch">
                            <span>{{form.title}}</span>
                        </p>
                    </template>
                    <template v-for="item in form.data">
                        <template v-if="item.type=='text'||item.type=='number'||item.type=='file'||item.type=='password'||item.type=='email'">
                            <div :class="['form-group',item.validate&&item.validate.required&&'required',item.operaFun&&'specialOpera',item.roasnm&&'roasnm']">
                                <label>{{item.name}}{{item.ps}}</label>
                                <input type="{{item.type}}" id="{{item.id}}" name="{{item.field}}" :class="['form-control']" accept="{{item.accept}}" checked="{{item.checked}}"
                                    v-model="formData[item.field]" max="{{item.max}}" min="{{item.min}}" maxlength="{{item.maxlength}}"
                                    multiple="{{item.multiple}}" v-bind:readonly="item.readonly==true&&readAdd||item.readonly=='ever'&&true||readonly"
                                    v-on:click="item.operaFun&&inputOpera(item.operaFun)">
                            </div>
                        </template>
                        <template v-if="item.type=='date'">
                            <div :class="['form-group','roasnm','form-group-date',item.validate&&item.validate.required&&'required']">
                                <label>{{item.name}}</label>
                                <input type="text" id="{{item.id}}" :readonly="item.readonly==true&&readAdd||item.readonly=='ever'&&true||readonly" class="form-control"
                                    name="{{item.field}}" v-model="formData[item.field]">
                            </div>
                        </template>
                        <template v-if="item.type=='radio'">
                            <div :class="['form-group','form-group-long',item.validate&&item.validate.required&&'required']">
                                <label>{{item.name}}</label>
                                <template v-for="item2 in item.radio">
                                    <span class="form-chose">
                                            <input type="radio" name="{{item.field}}" id="{{item2.id}}" value="{{item2.value}}" v-model="formData[item.field]" :disabled="item2.disabled==true&&readAdd||item2.disabled=='ever'&&true||disabled">
                                            <label for="{{item2.id}}">{{item2.name}}</label>
                                        </span>
                                </template>
                            </div>
                        </template>
                        <template v-if="item.type=='checkbox'">
                            <div :class="['form-group','form-group-long',item.validate&&item.validate.required&&'required']">
                                <label>{{item.name}}</label>
                                <template v-for="item2 in item.checkbox">
                                    <span class="form-chose">
                                            <input type="checkbox" name="{{item.field}}" id="{{item2.id}}" value="{{item2.value}}" v-model="formData[item.field]"  :disabled="item2.disabled==true&&readAdd||item2.disabled=='ever'&&true||disabled">
                                            <label for="{{item2.id}}">{{item2.name}}</label>
                                        </span>
                                </template>
                            </div>
                        </template>
                        <template v-if="item.type=='select'">
                            <div :class="['form-group',item.validate&&item.validate.required&&'required']">
                                <label>{{item.name}}</label>
                                <select-stand :id="item.id" :name="item.field" :info-type="item.select.infoTypes" :type="item.select.type" :readonly="item.readonly==true&&readAdd||item.readonly=='ever'&&true||readonly"
                                    :auto-chose="item.field" :auto-chose-cn="item.select.fieldCn" :localdata="item.select.localdata"
                                    :url="item.select.url" :after-chose="item.select.afterChose" :before-chose="item.select.beforeChose"
                                    :custom-field="item.select.customField" :spread-event="item.select.spreadEvent" :paras="item.select.paras"
                                    :link-field="item.select.linkField">
                                </select-stand>
                            </div>
                        </template>
                        <template v-if="item.type=='textarea'">
                            <div :class="['form-group','form-group-long',item.validate&&item.validate.required&&'required']">
                                <label>{{item.name}}</label>
                                <textarea class="form-control" :id="item.id" :name="item.field" :cols="item.col" :rows="item.row" v-model="formData[item.field]"
                                    v-on:click="item.operaFun&&inputOpera(item.operaFun)" :readonly="item.readonly==true&&readAdd||item.readonly=='ever'&&true||readonly"></textarea>
                            </div>
                        </template>
                        <template v-if="item.type=='image'">
                            <div :class="['form-group','form-group-long','form-group-img-scale']">
                                <label>{{item.name}}</label>
                                <img src="{{formData[item.field]}}" width="{{item.image.width}}">
                            </div>
                        </template>
                        <template v-if="item.type=='button'">
                            <div class="form-group form-group-long">
                                <label>{{item.name}}</label>
                                <template v-for="item2 in item.button">
                                    <a href="javascript:void(0);" v-on:click="item2.operaFun()" :class="['btn','btn-stand',item2.className||'']" :disabled="item2.disabled"
                                        :id="item2.id">{{item2.name}}</a>
                                </template>
                            </div>
                        </template>
                    </template>
                    <template v-if="statusForm.title">
                        <p class="title-switch">
                            <span>{{statusForm.title}}</span>
                        </p>
                        <template v-for="item in statusForm.data">
                            <div class="form-group">
                                <label>{{item.name}}</label>
                                <input type="text" class="form-control" v-model="formData[item.field]" required v-bind:readonly="true">
                            </div>
                        </template>
                    </template>

                    <template v-if="passWordOpera.title">
                        <p class="title-switch" href="javascript:;">
                            <span>{{passWordOpera.title}}</span>
                        </p>
                        <template v-for="item in passWordOpera.data">
                            <p class="lock-con">
                                <i class="icon-lock"></i>
                                <button v-on:click="item.operaFun()" class="btn btn-disabled" disabled>{{item.name}}</button>
                            </p>
                        </template>
                    </template>
                </div>
            </form>
            <div class="loding-con" style="display:none">
<p class="loding"><span></span><span></span><span></span><span></span><span></span><span></span></p>
</div>
</div>
</div>
</template>

<script>
    module.exports = {
        props: ['saveUrl', 'reqUrl', 'form', 'statusForm', 'passWordOpera', 'refresh', 'saveFun', 'openFun', 'closeFun', 'twoColumn', 'formSubmit', 'customOpera', 'dataReady', 'beforeSave'],
        data: function () {
            return {
                opeType: '', //操作类型,add,view,edit
                opeFid: '', //被操作fid
                num: 0,
                statu: '', //开关状态
                formData: {},
                ready: '',//数据是否就绪
                selectGroup: [],
                width: 300,
                vali: ''
            }

        },
        ready: function () {
            this.valiSet = {
                debug: true,
                onsubmit: false,
                onkeyup: false,
                errorElement: 'p',
                errorClass: 'form-wrong',
                rules: {

                }
            };
            var form = this.form.data;
            //初始化特殊表单控件
            var dateSet = {};
            for (var i = 0; i < form.length; i++) {
                //select
                if (form[i].type == 'select') {
                    this.selectGroup.push(i)
                }
                //date
                else if (form[i].type == 'date') {
                    // console.log(0)
                    // laydate(form[i].date);
                    if (!form[i].id) {
                        console.log('date组件需要配置id');
                    }
                    dateSet = form[i].date;
                    dateSet.scrollInput = false;
                    $('#' + form[i].id).datetimepicker(form[i].date);

                }
                if (form[i].validate) {
                    this.valiSet.rules[form[i].field] = form[i].validate;
                }
                if (form[i].customValidate) {
                    form[i].customValidate();
                }

                // this.$set('formData[form[i].field]','');
            }
            if (this.twoColumn) {
                this.width = 550;
                this.$el.style.width = this.width + 'px';
            }
            this.validateFun = $(this.$el.querySelector('form')).validate(this.valiSet);

            var self = this;


            // setTimeout(function () { 
            //     console.log($(self.$els.form).eq(0))
            // self.vali=$(self.$els.form)[0].validate(self.valiSet);
            //  },1000)

        },
        methods: {
            //all全部置空
            processEmptyField: function (all) {
                var form = this.form.data;
                for (var i = 0; i < form.length; i++) {
                    if (all || this.formData[form[i].field] == null || this.formData[form[i].field] == undefined) {
                        if (form[i].type != 'checkbox') {
                            Vue.set(this.formData, form[i].field, '');
                            if (form[i].dataField) {
                                Vue.set(this.formData, form[i].dataField, '');
                            }
                        }
                        else {
                            Vue.set(this.formData, form[i].field, []);
                        }

                    }
                }
            },
            open: function (type) {
                this.$el.style.right = '0px';
                if (type == undefined) {
                    type = 'add';
                }
                this.statu = 'open';
                this.opeType = type;
                if (type == 'add') {
                    this.$broadcast('formAdd');
                    this.processEmptyField(true);
                    // this.checkbox();
                }
                this.openFun && this.openFun();
            },
            close: function () {
                this.loding(0);
                this.$el.style.right = -this.width + 'px';
                this.$parent.$broadcast('form-panel', 'close');
                this.statu = 'close';
                this.opeType = '';
                this.opeFid = '';
                this.validateFun.resetForm();
                this.closeFun && this.closeFun();
            },
            req: function (fidpre, type) {
                this.ready = false;
                this.num++;
                var num2 = this.num;
                var self = this;
                this.loding(1);
                this.open(type);
                //请求数据资料
                $.ajax({
                    url: self.reqUrl,
                    type: "GET",
                    cache: false,
                    dataType: 'JSON',
                    data: { "fid": fidpre },
                    success: function (data) {
                        if (num2 == self.num) {
                            self.formData = data;
                            self.opeFid = fidpre;
                            self.$broadcast('formDataReady', data);
                            var form = self.form.data;
                            //初始化checkbox
                            self.checkbox();
                            self.loding(0);
                            self.ready = true;
                            self.processEmptyField();
                            self.dataReady && self.dataReady(data);
                            //访问select
                            // for(var i=0;i<self.selectGroup.length;i++)
                            // {
                            //     self.$children[i].choseSome(data[self.form.data[self.selectGroup[i]].field])
                            // }
                            // selectStatu.$refs.select1.choseSome(self.items.fcodeType)
                        }
                    },
                    error: function () {
                        self.loding(0);
                    }
                });
            },
            blur: function (field, id) {
                //处理类似于date等组件的数据绑定
                // var self = this;
                // setTimeout(function () { 
                //     self.formData[field] = document.querySelector('#'+id).value;
                //  },100)
            },
            //处理多选的格式,逗号隔开
            checkbox: function (startOrEnd, data) {
                var form = this.form.data;
                if (startOrEnd == 'start' || startOrEnd == null || startOrEnd == undefined) {
                    for (var i = 0; i < form.length; i++) {
                        if (form[i].type == 'checkbox') {
                            this.formData[form[i].field] = this.formData[form[i].field].split(',');
                        }
                    }
                }
                else if (startOrEnd == 'end')

                    for (var i = 0; i < form.length; i++) {
                        if (form[i].type == 'checkbox') {
                            data[form[i].field] = data[form[i].field].join(',');
                        }
                    }
            },
            valid: function () {
                if (!$(this.$el.querySelector('form')).valid()) return false
            },
            clone: function (obj) {
                return JSON.parse(JSON.stringify(obj));
            },
            getFormData: function () {
                //获取子组件的值
                for (var i = 0; i < this.selectGroup.length; i++) {
                    this.formData[this.form.data[this.selectGroup[i]].field] = this.$children[i].val();
                }

                var formData = this.clone(this.formData);
                for (var m in formData) {
                    formData[m] = htmlEncode(formData[m])
                }
                //处理checkbox
                this.checkbox('end', formData);
                return formData
            },
            saveMess: function () {
                if (this.opeType == 'edit' && !this.ready) return
                // if(!this.valid()) return false;
                if (!this.validateFun.form()) return false;
                var self = this;
                //获取子组件的值
                for (var i = 0; i < self.selectGroup.length; i++) {
                    this.formData[this.form.data[this.selectGroup[i]].field] = self.$children[i].val();
                }

                var formData = this.clone(this.formData);
                for (var m in formData) {
                    formData[m] = htmlEncode(formData[m])
                }
                //处理checkbox
                this.checkbox('end', formData);
                if (!this.saveFun) {
                    debugger

                    if (this.opeType == 'add' || this.opeType == 'edit') {
                        if (!this.formSubmit) {

                        }
                        if (!self.saveUrl) return
                        if (self.beforeSave) {
                            formData = self.beforeSave(formData);
                        }
                        //todo验证
                        $.ajax({
                            url: self.saveUrl,
                            type: "GET",
                            cache: false,
                            dataType: 'JSON',
                            data: formData,
                            success: function (data) {
                                self.close();
                                warnTop('保存成功！');
                                self.afterSaveFun && self.afterSaveFun();
                                // self.refresh();
                                // content.$refs.table1.pgChange(1);
                            },
                            error: function () {
                                self.loding(0);
                            }
                        });
                    } else {
                        self.close();
                    }
                }
                else {
                    this.saveFun();
                }


            },
            //如果只读，操作函数失效
            inputOpera: function (fun) {
                if (!this.readonly) {
                    fun();
                }
            },
            loding: function (para) {
                if (para) {
                    this.$el.querySelector('.loding-con').style.display = 'block';
                }
                else {
                    this.$el.querySelector('.loding-con').style.display = 'none';
                }
            },

        },
        computed: {
            readonly: function () {
                return this.opeType == 'view' && true || false
            },
            readAdd: function () {
                return this.opeType != 'add' && true || false
            },
            autoTitle: function () {
                return this.opeType == 'add' && '新增' || this.opeType == 'edit' && '编辑' || this.opeType == 'view' && '查看' || ' '
            }
            // checkboxCpt: {
            //     get: function(){
            //         var checkboxs ;
            //         if(this.form.data.length)
            //         {
            //             for (var i = 0; i<this.form.data.length;i++)
            //             {
            //                 if(this.form.data[i].type=='checkbox')
            //                 {
            //                     checkboxs[this.form.data[i].field] = this.formData[this.form.data[i].field].split(',');
            //                 }
            //             }
            //             return checkboxs
            //         }


            //     },
            //     set: function(newValue){
            //         for (var i in newValue)
            //         {
            //             this.formData[i] = newValue[i].join(',');
            //         }
            //     }
            // }
        },
        events: {
            'ztree-panel': function (msg) {
                if (this.statu == 'open') {
                    if (msg == 'open') {
                        this.$el.style.right = '340px'
                    }
                    else if (msg == 'close') {
                        this.$el.style.right = '0px';
                    }
                }

            }
        }
    }
</script>
<style>
    
</style>