/*!
 * @copyright Copyright &copy; Kartik Visweswaran, Krajee.com, 2014 - 2015
 * @version 1.3.3
 *
 * Date formatter utility library that allows formatting date/time variables or Date objects using PHP DateTime format.
 * @see http://php.net/manual/en/function.date.php
 *
 * For more JQuery plugins visit http://plugins.krajee.com
 * For more Yii related demos visit http://demos.krajee.com
 */
var DateFormatter;
(function () {
    "use strict";

    var _compare, _lpad, _extend, defaultSettings, DAY, HOUR;
    DAY = 1000 * 60 * 60 * 24;
    HOUR = 3600;

    _compare = function (str1, str2) {
        return typeof(str1) === 'string' && typeof(str2) === 'string' && str1.toLowerCase() === str2.toLowerCase();
    };
    _lpad = function (value, length, char) {
        var chr = char || '0', val = value.toString();
        return val.length < length ? _lpad(chr + val, length) : val;
    };
    _extend = function (out) {
        var i, obj;
        out = out || {};
        for (i = 1; i < arguments.length; i++) {
            obj = arguments[i];
            if (!obj) {
                continue;
            }
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (typeof obj[key] === 'object') {
                        _extend(out[key], obj[key]);
                    } else {
                        out[key] = obj[key];
                    }
                }
            }
        }
        return out;
    };
    defaultSettings = {
        dateSettings: {
            days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            months: [
                'January', 'February', 'March', 'April', 'May', 'June', 'July',
                'August', 'September', 'October', 'November', 'December'
            ],
            monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            meridiem: ['AM', 'PM'],
            ordinal: function (number) {
                var n = number % 10, suffixes = {1: 'st', 2: 'nd', 3: 'rd'};
                return Math.floor(number % 100 / 10) === 1 || !suffixes[n] ? 'th' : suffixes[n];
            }
        },
        separators: /[ \-+\/\.T:@]/g,
        validParts: /[dDjlNSwzWFmMntLoYyaABgGhHisueTIOPZcrU]/g,
        intParts: /[djwNzmnyYhHgGis]/g,
        tzParts: /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
        tzClip: /[^-+\dA-Z]/g
    };

    DateFormatter = function (options) {
        var self = this, config = _extend(defaultSettings, options);
        self.dateSettings = config.dateSettings;
        self.separators = config.separators;
        self.validParts = config.validParts;
        self.intParts = config.intParts;
        self.tzParts = config.tzParts;
        self.tzClip = config.tzClip;
    };

    DateFormatter.prototype = {
        constructor: DateFormatter,
        parseDate: function (vDate, vFormat) {
            var self = this, vFormatParts, vDateParts, i, vDateFlag = false, vTimeFlag = false, vDatePart, iDatePart,
                vSettings = self.dateSettings, vMonth, vMeriIndex, vMeriOffset, len, mer,
                out = {date: null, year: null, month: null, day: null, hour: 0, min: 0, sec: 0};
            if (!vDate) {
                return undefined;
            }
            if (vDate instanceof Date) {
                return vDate;
            }
            if (typeof vDate === 'number') {
                return new Date(vDate);
            }
            if (vFormat === 'U') {
                i = parseInt(vDate);
                return i ? new Date(i * 1000) : vDate;
            }
            if (typeof vDate !== 'string') {
                return '';
            }
            vFormatParts = vFormat.match(self.validParts);
            if (!vFormatParts || vFormatParts.length === 0) {
                throw new Error("Invalid date format definition.");
            }
            vDateParts = vDate.replace(self.separators, '\0').split('\0');
            for (i = 0; i < vDateParts.length; i++) {
                vDatePart = vDateParts[i];
                iDatePart = parseInt(vDatePart);
                switch (vFormatParts[i]) {
                    case 'y':
                    case 'Y':
                        len = vDatePart.length;
                        if (len === 2) {
                            out.year = parseInt((iDatePart < 70 ? '20' : '19') + vDatePart);
                        } else if (len === 4) {
                            out.year = iDatePart;
                        }
                        vDateFlag = true;
                        break;
                    case 'm':
                    case 'n':
                    case 'M':
                    case 'F':
                        if (isNaN(vDatePart)) {
                            vMonth = vSettings.monthsShort.indexOf(vDatePart);
                            if (vMonth > -1) {
                                out.month = vMonth + 1;
                            }
                            vMonth = vSettings.months.indexOf(vDatePart);
                            if (vMonth > -1) {
                                out.month = vMonth + 1;
                            }
                        } else {
                            if (iDatePart >= 1 && iDatePart <= 12) {
                                out.month = iDatePart;
                            }
                        }
                        vDateFlag = true;
                        break;
                    case 'd':
                    case 'j':
                        if (iDatePart >= 1 && iDatePart <= 31) {
                            out.day = iDatePart;
                        }
                        vDateFlag = true;
                        break;
                    case 'g':
                    case 'h':
                        vMeriIndex = (vFormatParts.indexOf('a') > -1) ? vFormatParts.indexOf('a') :
                            (vFormatParts.indexOf('A') > -1) ? vFormatParts.indexOf('A') : -1;
                        mer = vDateParts[vMeriIndex];
                        if (vMeriIndex > -1) {
                            vMeriOffset = _compare(mer, vSettings.meridiem[0]) ? 0 :
                                (_compare(mer, vSettings.meridiem[1]) ? 12 : -1);
                            if (iDatePart >= 1 && iDatePart <= 12 && vMeriOffset > -1) {
                                out.hour = iDatePart + vMeriOffset;
                            } else if (iDatePart >= 0 && iDatePart <= 23) {
                                out.hour = iDatePart;
                            }
                        } else if (iDatePart >= 0 && iDatePart <= 23) {
                            out.hour = iDatePart;
                        }
                        vTimeFlag = true;
                        break;
                    case 'G':
                    case 'H':
                        if (iDatePart >= 0 && iDatePart <= 23) {
                            out.hour = iDatePart;
                        }
                        vTimeFlag = true;
                        break;
                    case 'i':
                        if (iDatePart >= 0 && iDatePart <= 59) {
                            out.min = iDatePart;
                        }
                        vTimeFlag = true;
                        break;
                    case 's':
                        if (iDatePart >= 0 && iDatePart <= 59) {
                            out.sec = iDatePart;
                        }
                        vTimeFlag = true;
                        break;
                }
            }
            if (vDateFlag === true && out.year && out.month && out.day) {
                out.date = new Date(out.year, out.month - 1, out.day, out.hour, out.min, out.sec, 0);
            } else {
                if (vTimeFlag !== true) {
                    return false;
                }
                out.date = new Date(0, 0, 0, out.hour, out.min, out.sec, 0);
            }
            return out.date;
        },
        guessDate: function (vDateStr, vFormat) {
            if (typeof vDateStr !== 'string') {
                return vDateStr;
            }
            var self = this, vParts = vDateStr.replace(self.separators, '\0').split('\0'), vPattern = /^[djmn]/g,
                vFormatParts = vFormat.match(self.validParts), vDate = new Date(), vDigit = 0, vYear, i, iPart, iSec;

            if (!vPattern.test(vFormatParts[0])) {
                return vDateStr;
            }

            for (i = 0; i < vParts.length; i++) {
                vDigit = 2;
                iPart = vParts[i];
                iSec = parseInt(iPart.substr(0, 2));
                switch (i) {
                    case 0:
                        if (vFormatParts[0] === 'm' || vFormatParts[0] === 'n') {
                            vDate.setMonth(iSec - 1);
                        } else {
                            vDate.setDate(iSec);
                        }
                        break;
                    case 1:
                        if (vFormatParts[0] === 'm' || vFormatParts[0] === 'n') {
                            vDate.setDate(iSec);
                        } else {
                            vDate.setMonth(iSec - 1);
                        }
                        break;
                    case 2:
                        vYear = vDate.getFullYear();
                        if (iPart.length < 4) {
                            vDate.setFullYear(parseInt(vYear.toString().substr(0, 4 - iPart.length) + iPart));
                            vDigit = iPart.length;
                        } else {
                            vDate.setFullYear = parseInt(iPart.substr(0, 4));
                            vDigit = 4;
                        }
                        break;
                    case 3:
                        vDate.setHours(iSec);
                        break;
                    case 4:
                        vDate.setMinutes(iSec);
                        break;
                    case 5:
                        vDate.setSeconds(iSec);
                        break;
                }
                if (iPart.substr(vDigit).length > 0) {
                    vParts.splice(i + 1, 0, iPart.substr(vDigit));
                }
            }
            return vDate;
        },
        parseFormat: function (vChar, vDate) {
            var self = this, vSettings = self.dateSettings, fmt, backspace = /\\?(.?)/gi, doFormat = function (t, s) {
                return fmt[t] ? fmt[t]() : s;
            };
            fmt = {
                /////////
                // DAY //
                /////////
                /**
                 * Day of month with leading 0: `01..31`
                 * @return {string}
                 */
                d: function () {
                    return _lpad(fmt.j(), 2);
                },
                /**
                 * Shorthand day name: `Mon...Sun`
                 * @return {string}
                 */
                D: function () {
                    return vSettings.daysShort[fmt.w()];
                },
                /**
                 * Day of month: `1..31`
                 * @return {number}
                 */
                j: function () {
                    return vDate.getDate();
                },
                /**
                 * Full day name: `Monday...Sunday`
                 * @return {number}
                 */
                l: function () {
                    return vSettings.days[fmt.w()];
                },
                /**
                 * ISO-8601 day of week: `1[Mon]..7[Sun]`
                 * @return {number}
                 */
                N: function () {
                    return fmt.w() || 7;
                },
                /**
                 * Day of week: `0[Sun]..6[Sat]`
                 * @return {number}
                 */
                w: function () {
                    return vDate.getDay();
                },
                /**
                 * Day of year: `0..365`
                 * @return {number}
                 */
                z: function () {
                    var a = new Date(fmt.Y(), fmt.n() - 1, fmt.j()), b = new Date(fmt.Y(), 0, 1);
                    return Math.round((a - b) / DAY);
                },

                //////////
                // WEEK //
                //////////
                /**
                 * ISO-8601 week number
                 * @return {number}
                 */
                W: function () {
                    var a = new Date(fmt.Y(), fmt.n() - 1, fmt.j() - fmt.N() + 3), b = new Date(a.getFullYear(), 0, 4);
                    return _lpad(1 + Math.round((a - b) / DAY / 7), 2);
                },

                ///////////
                // MONTH //
                ///////////
                /**
                 * Full month name: `January...December`
                 * @return {string}
                 */
                F: function () {
                    return vSettings.months[vDate.getMonth()];
                },
                /**
                 * Month w/leading 0: `01..12`
                 * @return {string}
                 */
                m: function () {
                    return _lpad(fmt.n(), 2);
                },
                /**
                 * Shorthand month name; `Jan...Dec`
                 * @return {string}
                 */
                M: function () {
                    return vSettings.monthsShort[vDate.getMonth()];
                },
                /**
                 * Month: `1...12`
                 * @return {number}
                 */
                n: function () {
                    return vDate.getMonth() + 1;
                },
                /**
                 * Days in month: `28...31`
                 * @return {number}
                 */
                t: function () {
                    return (new Date(fmt.Y(), fmt.n(), 0)).getDate();
                },

                //////////
                // YEAR //
                //////////
                /**
                 * Is leap year? `0 or 1`
                 * @return {number}
                 */
                L: function () {
                    var Y = fmt.Y();
                    return (Y % 4 === 0 && Y % 100 !== 0 || Y % 400 === 0) ? 1 : 0;
                },
                /**
                 * ISO-8601 year
                 * @return {number}
                 */
                o: function () {
                    var n = fmt.n(), W = fmt.W(), Y = fmt.Y();
                    return Y + (n === 12 && W < 9 ? 1 : n === 1 && W > 9 ? -1 : 0);
                },
                /**
                 * Full year: `e.g. 1980...2010`
                 * @return {number}
                 */
                Y: function () {
                    return vDate.getFullYear();
                },
                /**
                 * Last two digits of year: `00...99`
                 * @return {string}
                 */
                y: function () {
                    return fmt.Y().toString().slice(-2);
                },

                //////////
                // TIME //
                //////////
                /**
                 * Meridian lower: `am or pm`
                 * @return {string}
                 */
                a: function () {
                    return fmt.A().toLowerCase();
                },
                /**
                 * Meridian upper: `AM or PM`
                 * @return {string}
                 */
                A: function () {
                    var n = fmt.G() < 12 ? 0 : 1;
                    return vSettings.meridiem[n];
                },
                /**
                 * Swatch Internet time: `000..999`
                 * @return {string}
                 */
                B: function () {
                    var H = vDate.getUTCHours() * HOUR, i = vDate.getUTCMinutes() * 60, s = vDate.getUTCSeconds();
                    return _lpad(Math.floor((H + i + s + HOUR) / 86.4) % 1000, 3);
                },
                /**
                 * 12-Hours: `1..12`
                 * @return {number}
                 */
                g: function () {
                    return fmt.G() % 12 || 12;
                },
                /**
                 * 24-Hours: `0..23`
                 * @return {number}
                 */
                G: function () {
                    return vDate.getHours();
                },
                /**
                 * 12-Hours with leading 0: `01..12`
                 * @return {string}
                 */
                h: function () {
                    return _lpad(fmt.g(), 2);
                },
                /**
                 * 24-Hours w/leading 0: `00..23`
                 * @return {string}
                 */
                H: function () {
                    return _lpad(fmt.G(), 2);
                },
                /**
                 * Minutes w/leading 0: `00..59`
                 * @return {string}
                 */
                i: function () {
                    return _lpad(vDate.getMinutes(), 2);
                },
                /**
                 * Seconds w/leading 0: `00..59`
                 * @return {string}
                 */
                s: function () {
                    return _lpad(vDate.getSeconds(), 2);
                },
                /**
                 * Microseconds: `000000-999000`
                 * @return {string}
                 */
                u: function () {
                    return _lpad(vDate.getMilliseconds() * 1000, 6);
                },

                //////////////
                // TIMEZONE //
                //////////////
                /**
                 * Timezone identifier: `e.g. Atlantic/Azores, ...`
                 * @return {string}
                 */
                e: function () {
                    var str = /\((.*)\)/.exec(String(vDate))[1];
                    return str || 'Coordinated Universal Time';
                },
                /**
                 * Timezone abbreviation: `e.g. EST, MDT, ...`
                 * @return {string}
                 */
                T: function () {
                    var str = (String(vDate).match(self.tzParts) || [""]).pop().replace(self.tzClip, "");
                    return str || 'UTC';
                },
                /**
                 * DST observed? `0 or 1`
                 * @return {number}
                 */
                I: function () {
                    var a = new Date(fmt.Y(), 0), c = Date.UTC(fmt.Y(), 0),
                        b = new Date(fmt.Y(), 6), d = Date.UTC(fmt.Y(), 6);
                    return ((a - c) !== (b - d)) ? 1 : 0;
                },
                /**
                 * Difference to GMT in hour format: `e.g. +0200`
                 * @return {string}
                 */
                O: function () {
                    var tzo = vDate.getTimezoneOffset(), a = Math.abs(tzo);
                    return (tzo > 0 ? '-' : '+') + _lpad(Math.floor(a / 60) * 100 + a % 60, 4);
                },
                /**
                 * Difference to GMT with colon: `e.g. +02:00`
                 * @return {string}
                 */
                P: function () {
                    var O = fmt.O();
                    return (O.substr(0, 3) + ':' + O.substr(3, 2));
                },
                /**
                 * Timezone offset in seconds: `-43200...50400`
                 * @return {number}
                 */
                Z: function () {
                    return -vDate.getTimezoneOffset() * 60;
                },

                ////////////////////
                // FULL DATE TIME //
                ////////////////////
                /**
                 * ISO-8601 date
                 * @return {string}
                 */
                c: function () {
                    return 'Y-m-d\\TH:i:sP'.replace(backspace, doFormat);
                },
                /**
                 * RFC 2822 date
                 * @return {string}
                 */
                r: function () {
                    return 'D, d M Y H:i:s O'.replace(backspace, doFormat);
                },
                /**
                 * Seconds since UNIX epoch
                 * @return {number}
                 */
                U: function () {
                    return vDate.getTime() / 1000 || 0;
                }
            };
            return doFormat(vChar, vChar);
        },
        formatDate: function (vDate, vFormat) {
            var self = this, i, n, len, str, vChar, vDateStr = '';
            if (typeof vDate === 'string') {
                vDate = self.parseDate(vDate, vFormat);
                if (vDate === false) {
                    return false;
                }
            }
            if (vDate instanceof Date) {
                len = vFormat.length;
                for (i = 0; i < len; i++) {
                    vChar = vFormat.charAt(i);
                    if (vChar === 'S') {
                        continue;
                    }
                    str = self.parseFormat(vChar, vDate);
                    if (i !== (len - 1) && self.intParts.test(vChar) && vFormat.charAt(i + 1) === 'S') {
                        n = parseInt(str);
                        str += self.dateSettings.ordinal(n);
                    }
                    vDateStr += str;
                }
                return vDateStr;
            }
            return '';
        }
    };
})();/**
 * @preserve jQuery DateTimePicker plugin v2.5.4
 * @homepage http://xdsoft.net/jqplugins/datetimepicker/
 * @author Chupurnov Valeriy (<chupurnov@gmail.com>)
 */
/*global DateFormatter, document,window,jQuery,setTimeout,clearTimeout,HighlightedDate,getCurrentValue*/
;(function (factory) {
	if ( typeof define === 'function' && define.amd ) {
		// AMD. Register as an anonymous module.
		define(['jquery', 'jquery-mousewheel'], factory);
	} else if (typeof exports === 'object') {
		// Node/CommonJS style for Browserify
		module.exports = factory;
	} else {
		// Browser globals
		factory(jQuery);
	}
}(function ($) {
	'use strict';
	
	var currentlyScrollingTimeDiv = false;
	
	var default_options  = {
		i18n: {
			ar: { // Arabic
				months: [
					"كانون الثاني", "شباط", "آذار", "نيسان", "مايو", "حزيران", "تموز", "آب", "أيلول", "تشرين الأول", "تشرين الثاني", "كانون الأول"
				],
				dayOfWeekShort: [
					"ن", "ث", "ع", "خ", "ج", "س", "ح"
				],
				dayOfWeek: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"]
			},
			ro: { // Romanian
				months: [
					"Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie", "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"
				],
				dayOfWeekShort: [
					"Du", "Lu", "Ma", "Mi", "Jo", "Vi", "Sâ"
				],
				dayOfWeek: ["Duminică", "Luni", "Marţi", "Miercuri", "Joi", "Vineri", "Sâmbătă"]
			},
			id: { // Indonesian
				months: [
					"Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"
				],
				dayOfWeekShort: [
					"Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"
				],
				dayOfWeek: ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
			},
			is: { // Icelandic
				months: [
					"Janúar", "Febrúar", "Mars", "Apríl", "Maí", "Júní", "Júlí", "Ágúst", "September", "Október", "Nóvember", "Desember"
				],
				dayOfWeekShort: [
					"Sun", "Mán", "Þrið", "Mið", "Fim", "Fös", "Lau"
				],
				dayOfWeek: ["Sunnudagur", "Mánudagur", "Þriðjudagur", "Miðvikudagur", "Fimmtudagur", "Föstudagur", "Laugardagur"]
			},
			bg: { // Bulgarian
				months: [
					"Януари", "Февруари", "Март", "Април", "Май", "Юни", "Юли", "Август", "Септември", "Октомври", "Ноември", "Декември"
				],
				dayOfWeekShort: [
					"Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"
				],
				dayOfWeek: ["Неделя", "Понеделник", "Вторник", "Сряда", "Четвъртък", "Петък", "Събота"]
			},
			fa: { // Persian/Farsi
				months: [
					'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
				],
				dayOfWeekShort: [
					'یکشنبه', 'دوشنبه', 'سه شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'
				],
				dayOfWeek: ["یک‌شنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه", "شنبه", "یک‌شنبه"]
			},
			ru: { // Russian
				months: [
					'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
				],
				dayOfWeekShort: [
					"Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"
				],
				dayOfWeek: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"]
			},
			uk: { // Ukrainian
				months: [
					'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
				],
				dayOfWeekShort: [
					"Ндл", "Пнд", "Втр", "Срд", "Чтв", "Птн", "Сбт"
				],
				dayOfWeek: ["Неділя", "Понеділок", "Вівторок", "Середа", "Четвер", "П'ятниця", "Субота"]
			},
			en: { // English
				months: [
					"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
				],
				dayOfWeekShort: [
					"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
				],
				dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
			},
			el: { // Ελληνικά
				months: [
					"Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος", "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος"
				],
				dayOfWeekShort: [
					"Κυρ", "Δευ", "Τρι", "Τετ", "Πεμ", "Παρ", "Σαβ"
				],
				dayOfWeek: ["Κυριακή", "Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"]
			},
			de: { // German
				months: [
					'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
				],
				dayOfWeekShort: [
					"So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"
				],
				dayOfWeek: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"]
			},
			nl: { // Dutch
				months: [
					"januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"
				],
				dayOfWeekShort: [
					"zo", "ma", "di", "wo", "do", "vr", "za"
				],
				dayOfWeek: ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"]
			},
			tr: { // Turkish
				months: [
					"Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
				],
				dayOfWeekShort: [
					"Paz", "Pts", "Sal", "Çar", "Per", "Cum", "Cts"
				],
				dayOfWeek: ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"]
			},
			fr: { //French
				months: [
					"Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
				],
				dayOfWeekShort: [
					"Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"
				],
				dayOfWeek: ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"]
			},
			es: { // Spanish
				months: [
					"Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
				],
				dayOfWeekShort: [
					"Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"
				],
				dayOfWeek: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
			},
			th: { // Thai
				months: [
					'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
				],
				dayOfWeekShort: [
					'อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'
				],
				dayOfWeek: ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์", "อาทิตย์"]
			},
			pl: { // Polish
				months: [
					"styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec", "lipiec", "sierpień", "wrzesień", "październik", "listopad", "grudzień"
				],
				dayOfWeekShort: [
					"nd", "pn", "wt", "śr", "cz", "pt", "sb"
				],
				dayOfWeek: ["niedziela", "poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota"]
			},
			pt: { // Portuguese
				months: [
					"Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
				],
				dayOfWeekShort: [
					"Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"
				],
				dayOfWeek: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]
			},
			ch: { // Simplified Chinese
				months: [
					"一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"
				],
				dayOfWeekShort: [
					"日", "一", "二", "三", "四", "五", "六"
				]
			},
			se: { // Swedish
				months: [
					"Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September",  "Oktober", "November", "December"
				],
				dayOfWeekShort: [
					"Sön", "Mån", "Tis", "Ons", "Tor", "Fre", "Lör"
				]
			},
			kr: { // Korean
				months: [
					"1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"
				],
				dayOfWeekShort: [
					"일", "월", "화", "수", "목", "금", "토"
				],
				dayOfWeek: ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"]
			},
			it: { // Italian
				months: [
					"Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
				],
				dayOfWeekShort: [
					"Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"
				],
				dayOfWeek: ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"]
			},
			da: { // Dansk
				months: [
					"January", "Februar", "Marts", "April", "Maj", "Juni", "July", "August", "September", "Oktober", "November", "December"
				],
				dayOfWeekShort: [
					"Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"
				],
				dayOfWeek: ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"]
			},
			no: { // Norwegian
				months: [
					"Januar", "Februar", "Mars", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Desember"
				],
				dayOfWeekShort: [
					"Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"
				],
				dayOfWeek: ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag']
			},
			ja: { // Japanese
				months: [
					"1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"
				],
				dayOfWeekShort: [
					"日", "月", "火", "水", "木", "金", "土"
				],
				dayOfWeek: ["日曜", "月曜", "火曜", "水曜", "木曜", "金曜", "土曜"]
			},
			vi: { // Vietnamese
				months: [
					"Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
				],
				dayOfWeekShort: [
					"CN", "T2", "T3", "T4", "T5", "T6", "T7"
				],
				dayOfWeek: ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"]
			},
			sl: { // Slovenščina
				months: [
					"Januar", "Februar", "Marec", "April", "Maj", "Junij", "Julij", "Avgust", "September", "Oktober", "November", "December"
				],
				dayOfWeekShort: [
					"Ned", "Pon", "Tor", "Sre", "Čet", "Pet", "Sob"
				],
				dayOfWeek: ["Nedelja", "Ponedeljek", "Torek", "Sreda", "Četrtek", "Petek", "Sobota"]
			},
			cs: { // Čeština
				months: [
					"Leden", "Únor", "Březen", "Duben", "Květen", "Červen", "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"
				],
				dayOfWeekShort: [
					"Ne", "Po", "Út", "St", "Čt", "Pá", "So"
				]
			},
			hu: { // Hungarian
				months: [
					"Január", "Február", "Március", "Április", "Május", "Június", "Július", "Augusztus", "Szeptember", "Október", "November", "December"
				],
				dayOfWeekShort: [
					"Va", "Hé", "Ke", "Sze", "Cs", "Pé", "Szo"
				],
				dayOfWeek: ["vasárnap", "hétfő", "kedd", "szerda", "csütörtök", "péntek", "szombat"]
			},
			az: { //Azerbaijanian (Azeri)
				months: [
					"Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"
				],
				dayOfWeekShort: [
					"B", "Be", "Ça", "Ç", "Ca", "C", "Ş"
				],
				dayOfWeek: ["Bazar", "Bazar ertəsi", "Çərşənbə axşamı", "Çərşənbə", "Cümə axşamı", "Cümə", "Şənbə"]
			},
			bs: { //Bosanski
				months: [
					"Januar", "Februar", "Mart", "April", "Maj", "Jun", "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"
				],
				dayOfWeekShort: [
					"Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"
				],
				dayOfWeek: ["Nedjelja","Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak", "Subota"]
			},
			ca: { //Català
				months: [
					"Gener", "Febrer", "Març", "Abril", "Maig", "Juny", "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre"
				],
				dayOfWeekShort: [
					"Dg", "Dl", "Dt", "Dc", "Dj", "Dv", "Ds"
				],
				dayOfWeek: ["Diumenge", "Dilluns", "Dimarts", "Dimecres", "Dijous", "Divendres", "Dissabte"]
			},
			'en-GB': { //English (British)
				months: [
					"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
				],
				dayOfWeekShort: [
					"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
				],
				dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
			},
			et: { //"Eesti"
				months: [
					"Jaanuar", "Veebruar", "Märts", "Aprill", "Mai", "Juuni", "Juuli", "August", "September", "Oktoober", "November", "Detsember"
				],
				dayOfWeekShort: [
					"P", "E", "T", "K", "N", "R", "L"
				],
				dayOfWeek: ["Pühapäev", "Esmaspäev", "Teisipäev", "Kolmapäev", "Neljapäev", "Reede", "Laupäev"]
			},
			eu: { //Euskara
				months: [
					"Urtarrila", "Otsaila", "Martxoa", "Apirila", "Maiatza", "Ekaina", "Uztaila", "Abuztua", "Iraila", "Urria", "Azaroa", "Abendua"
				],
				dayOfWeekShort: [
					"Ig.", "Al.", "Ar.", "Az.", "Og.", "Or.", "La."
				],
				dayOfWeek: ['Igandea', 'Astelehena', 'Asteartea', 'Asteazkena', 'Osteguna', 'Ostirala', 'Larunbata']
			},
			fi: { //Finnish (Suomi)
				months: [
					"Tammikuu", "Helmikuu", "Maaliskuu", "Huhtikuu", "Toukokuu", "Kesäkuu", "Heinäkuu", "Elokuu", "Syyskuu", "Lokakuu", "Marraskuu", "Joulukuu"
				],
				dayOfWeekShort: [
					"Su", "Ma", "Ti", "Ke", "To", "Pe", "La"
				],
				dayOfWeek: ["sunnuntai", "maanantai", "tiistai", "keskiviikko", "torstai", "perjantai", "lauantai"]
			},
			gl: { //Galego
				months: [
					"Xan", "Feb", "Maz", "Abr", "Mai", "Xun", "Xul", "Ago", "Set", "Out", "Nov", "Dec"
				],
				dayOfWeekShort: [
					"Dom", "Lun", "Mar", "Mer", "Xov", "Ven", "Sab"
				],
				dayOfWeek: ["Domingo", "Luns", "Martes", "Mércores", "Xoves", "Venres", "Sábado"]
			},
			hr: { //Hrvatski
				months: [
					"Siječanj", "Veljača", "Ožujak", "Travanj", "Svibanj", "Lipanj", "Srpanj", "Kolovoz", "Rujan", "Listopad", "Studeni", "Prosinac"
				],
				dayOfWeekShort: [
					"Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"
				],
				dayOfWeek: ["Nedjelja", "Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak", "Subota"]
			},
			ko: { //Korean (한국어)
				months: [
					"1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"
				],
				dayOfWeekShort: [
					"일", "월", "화", "수", "목", "금", "토"
				],
				dayOfWeek: ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"]
			},
			lt: { //Lithuanian (lietuvių)
				months: [
					"Sausio", "Vasario", "Kovo", "Balandžio", "Gegužės", "Birželio", "Liepos", "Rugpjūčio", "Rugsėjo", "Spalio", "Lapkričio", "Gruodžio"
				],
				dayOfWeekShort: [
					"Sek", "Pir", "Ant", "Tre", "Ket", "Pen", "Šeš"
				],
				dayOfWeek: ["Sekmadienis", "Pirmadienis", "Antradienis", "Trečiadienis", "Ketvirtadienis", "Penktadienis", "Šeštadienis"]
			},
			lv: { //Latvian (Latviešu)
				months: [
					"Janvāris", "Februāris", "Marts", "Aprīlis ", "Maijs", "Jūnijs", "Jūlijs", "Augusts", "Septembris", "Oktobris", "Novembris", "Decembris"
				],
				dayOfWeekShort: [
					"Sv", "Pr", "Ot", "Tr", "Ct", "Pk", "St"
				],
				dayOfWeek: ["Svētdiena", "Pirmdiena", "Otrdiena", "Trešdiena", "Ceturtdiena", "Piektdiena", "Sestdiena"]
			},
			mk: { //Macedonian (Македонски)
				months: [
					"јануари", "февруари", "март", "април", "мај", "јуни", "јули", "август", "септември", "октомври", "ноември", "декември"
				],
				dayOfWeekShort: [
					"нед", "пон", "вто", "сре", "чет", "пет", "саб"
				],
				dayOfWeek: ["Недела", "Понеделник", "Вторник", "Среда", "Четврток", "Петок", "Сабота"]
			},
			mn: { //Mongolian (Монгол)
				months: [
					"1-р сар", "2-р сар", "3-р сар", "4-р сар", "5-р сар", "6-р сар", "7-р сар", "8-р сар", "9-р сар", "10-р сар", "11-р сар", "12-р сар"
				],
				dayOfWeekShort: [
					"Дав", "Мяг", "Лха", "Пүр", "Бсн", "Бям", "Ням"
				],
				dayOfWeek: ["Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба", "Ням"]
			},
			'pt-BR': { //Português(Brasil)
				months: [
					"Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
				],
				dayOfWeekShort: [
					"Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"
				],
				dayOfWeek: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]
			},
			sk: { //Slovenčina
				months: [
					"Január", "Február", "Marec", "Apríl", "Máj", "Jún", "Júl", "August", "September", "Október", "November", "December"
				],
				dayOfWeekShort: [
					"Ne", "Po", "Ut", "St", "Št", "Pi", "So"
				],
				dayOfWeek: ["Nedeľa", "Pondelok", "Utorok", "Streda", "Štvrtok", "Piatok", "Sobota"]
			},
			sq: { //Albanian (Shqip)
				months: [
					"Janar", "Shkurt", "Mars", "Prill", "Maj", "Qershor", "Korrik", "Gusht", "Shtator", "Tetor", "Nëntor", "Dhjetor"
				],
				dayOfWeekShort: [
					"Die", "Hën", "Mar", "Mër", "Enj", "Pre", "Shtu"
				],
				dayOfWeek: ["E Diel", "E Hënë", "E Martē", "E Mërkurë", "E Enjte", "E Premte", "E Shtunë"]
			},
			'sr-YU': { //Serbian (Srpski)
				months: [
					"Januar", "Februar", "Mart", "April", "Maj", "Jun", "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"
				],
				dayOfWeekShort: [
					"Ned", "Pon", "Uto", "Sre", "čet", "Pet", "Sub"
				],
				dayOfWeek: ["Nedelja","Ponedeljak", "Utorak", "Sreda", "Četvrtak", "Petak", "Subota"]
			},
			sr: { //Serbian Cyrillic (Српски)
				months: [
					"јануар", "фебруар", "март", "април", "мај", "јун", "јул", "август", "септембар", "октобар", "новембар", "децембар"
				],
				dayOfWeekShort: [
					"нед", "пон", "уто", "сре", "чет", "пет", "суб"
				],
				dayOfWeek: ["Недеља","Понедељак", "Уторак", "Среда", "Четвртак", "Петак", "Субота"]
			},
			sv: { //Svenska
				months: [
					"Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December"
				],
				dayOfWeekShort: [
					"Sön", "Mån", "Tis", "Ons", "Tor", "Fre", "Lör"
				],
				dayOfWeek: ["Söndag", "Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag"]
			},
			'zh-TW': { //Traditional Chinese (繁體中文)
				months: [
					"一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"
				],
				dayOfWeekShort: [
					"日", "一", "二", "三", "四", "五", "六"
				],
				dayOfWeek: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]
			},
			zh: { //Simplified Chinese (简体中文)
				months: [
					"一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"
				],
				dayOfWeekShort: [
					"日", "一", "二", "三", "四", "五", "六"
				],
				dayOfWeek: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]
			},
			he: { //Hebrew (עברית)
				months: [
					'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
				],
				dayOfWeekShort: [
					'א\'', 'ב\'', 'ג\'', 'ד\'', 'ה\'', 'ו\'', 'שבת'
				],
				dayOfWeek: ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת", "ראשון"]
			},
			hy: { // Armenian
				months: [
					"Հունվար", "Փետրվար", "Մարտ", "Ապրիլ", "Մայիս", "Հունիս", "Հուլիս", "Օգոստոս", "Սեպտեմբեր", "Հոկտեմբեր", "Նոյեմբեր", "Դեկտեմբեր"
				],
				dayOfWeekShort: [
					"Կի", "Երկ", "Երք", "Չոր", "Հնգ", "Ուրբ", "Շբթ"
				],
				dayOfWeek: ["Կիրակի", "Երկուշաբթի", "Երեքշաբթի", "Չորեքշաբթի", "Հինգշաբթի", "Ուրբաթ", "Շաբաթ"]
			},
			kg: { // Kyrgyz
				months: [
					'Үчтүн айы', 'Бирдин айы', 'Жалган Куран', 'Чын Куран', 'Бугу', 'Кулжа', 'Теке', 'Баш Оона', 'Аяк Оона', 'Тогуздун айы', 'Жетинин айы', 'Бештин айы'
				],
				dayOfWeekShort: [
					"Жек", "Дүй", "Шей", "Шар", "Бей", "Жум", "Ише"
				],
				dayOfWeek: [
					"Жекшемб", "Дүйшөмб", "Шейшемб", "Шаршемб", "Бейшемби", "Жума", "Ишенб"
				]
			},
			rm: { // Romansh
				months: [
					"Schaner", "Favrer", "Mars", "Avrigl", "Matg", "Zercladur", "Fanadur", "Avust", "Settember", "October", "November", "December"
				],
				dayOfWeekShort: [
					"Du", "Gli", "Ma", "Me", "Gie", "Ve", "So"
				],
				dayOfWeek: [
					"Dumengia", "Glindesdi", "Mardi", "Mesemna", "Gievgia", "Venderdi", "Sonda"
				]
			},
			ka: { // Georgian
				months: [
					'იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი', 'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'
				],
				dayOfWeekShort: [
					"კვ", "ორშ", "სამშ", "ოთხ", "ხუთ", "პარ", "შაბ"
				],
				dayOfWeek: ["კვირა", "ორშაბათი", "სამშაბათი", "ოთხშაბათი", "ხუთშაბათი", "პარასკევი", "შაბათი"]
			},
		},
		value: '',
		rtl: false,

		format:	'Y/m/d H:i',
		formatTime:	'H:i',
		formatDate:	'Y/m/d',

		startDate:	false, // new Date(), '1986/12/08', '-1970/01/05','-1970/01/05',
		step: 60,
		monthChangeSpinner: true,

		closeOnDateSelect: false,
		closeOnTimeSelect: true,
		closeOnWithoutClick: true,
		closeOnInputClick: true,

		timepicker: true,
		datepicker: true,
		weeks: false,

		defaultTime: false,	// use formatTime format (ex. '10:00' for formatTime:	'H:i')
		defaultDate: false,	// use formatDate format (ex new Date() or '1986/12/08' or '-1970/01/05' or '-1970/01/05')

		minDate: false,
		maxDate: false,
		minTime: false,
		maxTime: false,
		disabledMinTime: false,
		disabledMaxTime: false,

		allowTimes: [],
		opened: false,
		initTime: true,
		inline: false,
		theme: '',

		onSelectDate: function () {},
		onSelectTime: function () {},
		onChangeMonth: function () {},
		onGetWeekOfYear: function () {},
		onChangeYear: function () {},
		onChangeDateTime: function () {},
		onShow: function () {},
		onClose: function () {},
		onGenerate: function () {},

		withoutCopyright: true,
		inverseButton: false,
		hours12: false,
		next: 'xdsoft_next',
		prev : 'xdsoft_prev',
		dayOfWeekStart: 0,
		parentID: 'body',
		timeHeightInTimePicker: 25,
		timepickerScrollbar: true,
		todayButton: true,
		prevButton: true,
		nextButton: true,
		defaultSelect: true,

		scrollMonth: true,
		scrollTime: true,
		scrollInput: true,

		lazyInit: false,
		mask: false,
		validateOnBlur: true,
		allowBlank: true,
		yearStart: 1950,
		yearEnd: 2050,
		monthStart: 0,
		monthEnd: 11,
		style: '',
		id: '',
		fixed: false,
		roundTime: 'round', // ceil, floor
		className: '',
		weekends: [],
		highlightedDates: [],
		highlightedPeriods: [],
		allowDates : [],
		allowDateRe : null,
		disabledDates : [],
		disabledWeekDays: [],
		yearOffset: 0,
		beforeShowDay: null,

		enterLikeTab: true,
		showApplyButton: false
	};

	var dateHelper = null,
		globalLocaleDefault = 'en',
		globalLocale = 'en';

	var dateFormatterOptionsDefault = {
		meridiem: ['AM', 'PM']
	};

	var initDateFormatter = function(){
		var locale = default_options.i18n[globalLocale],
			opts = {
				days: locale.dayOfWeek,
				daysShort: locale.dayOfWeekShort,
				months: locale.months,
				monthsShort: $.map(locale.months, function(n){ return n.substring(0, 3) }),
			};

	 	dateHelper = new DateFormatter({
			dateSettings: $.extend({}, dateFormatterOptionsDefault, opts)
		});
	};

	// for locale settings
	$.datetimepicker = {
		setLocale: function(locale){
			var newLocale = default_options.i18n[locale]?locale:globalLocaleDefault;
			if(globalLocale != newLocale){
				globalLocale = newLocale;
				// reinit date formatter
				initDateFormatter();
			}
		},
		setDateFormatter: function(dateFormatter) {
			dateHelper = dateFormatter;
		},
		RFC_2822: 'D, d M Y H:i:s O',
		ATOM: 'Y-m-d\TH:i:sP',
		ISO_8601: 'Y-m-d\TH:i:sO',
		RFC_822: 'D, d M y H:i:s O',
		RFC_850: 'l, d-M-y H:i:s T',
		RFC_1036: 'D, d M y H:i:s O',
		RFC_1123: 'D, d M Y H:i:s O',
		RSS: 'D, d M Y H:i:s O',
		W3C: 'Y-m-d\TH:i:sP'
	};

	// first init date formatter
	initDateFormatter();

	// fix for ie8
	if (!window.getComputedStyle) {
		window.getComputedStyle = function (el, pseudo) {
			this.el = el;
			this.getPropertyValue = function (prop) {
				var re = /(\-([a-z]){1})/g;
				if (prop === 'float') {
					prop = 'styleFloat';
				}
				if (re.test(prop)) {
					prop = prop.replace(re, function (a, b, c) {
						return c.toUpperCase();
					});
				}
				return el.currentStyle[prop] || null;
			};
			return this;
		};
	}
	if (!Array.prototype.indexOf) {
		Array.prototype.indexOf = function (obj, start) {
			var i, j;
			for (i = (start || 0), j = this.length; i < j; i += 1) {
				if (this[i] === obj) { return i; }
			}
			return -1;
		};
	}
	Date.prototype.countDaysInMonth = function () {
		return new Date(this.getFullYear(), this.getMonth() + 1, 0).getDate();
	};
	Date.prototype.dateFormat = function () {
		return this
	};
	$.fn.xdsoftScroller = function (percent) {
		return this.each(function () {
			var timeboxparent = $(this),
				pointerEventToXY = function (e) {
					var out = {x: 0, y: 0},
						touch;
					if (e.type === 'touchstart' || e.type === 'touchmove' || e.type === 'touchend' || e.type === 'touchcancel') {
						touch  = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
						out.x = touch.clientX;
						out.y = touch.clientY;
					} else if (e.type === 'mousedown' || e.type === 'mouseup' || e.type === 'mousemove' || e.type === 'mouseover' || e.type === 'mouseout' || e.type === 'mouseenter' || e.type === 'mouseleave') {
						out.x = e.clientX;
						out.y = e.clientY;
					}
					return out;
				},
				timebox,
				parentHeight,
				height,
				scrollbar,
				scroller,
				maximumOffset = 100,
				start = false,
				startY = 0,
				startTop = 0,
				h1 = 0,
				touchStart = false,
				startTopScroll = 0,
				calcOffset = function () {};
			if (percent === 'hide') {
				timeboxparent.find('.xdsoft_scrollbar').hide();
				return;
			}
			if (!$(this).hasClass('xdsoft_scroller_box')) {
				timebox = timeboxparent.children().eq(0);
				parentHeight = timeboxparent[0].clientHeight;
				height = timebox[0].offsetHeight;
				scrollbar = $('<div class="xdsoft_scrollbar"></div>');
				scroller = $('<div class="xdsoft_scroller"></div>');
				scrollbar.append(scroller);

				timeboxparent.addClass('xdsoft_scroller_box').append(scrollbar);
				calcOffset = function calcOffset(event) {
					var offset = pointerEventToXY(event).y - startY + startTopScroll;
					if (offset < 0) {
						offset = 0;
					}
					if (offset + scroller[0].offsetHeight > h1) {
						offset = h1 - scroller[0].offsetHeight;
					}
					timeboxparent.trigger('scroll_element.xdsoft_scroller', [maximumOffset ? offset / maximumOffset : 0]);
				};

				scroller
					.on('touchstart.xdsoft_scroller mousedown.xdsoft_scroller', function (event) {
						if (!parentHeight) {
							timeboxparent.trigger('resize_scroll.xdsoft_scroller', [percent]);
						}

						startY = pointerEventToXY(event).y;
						startTopScroll = parseInt(scroller.css('margin-top'), 10);
						h1 = scrollbar[0].offsetHeight;

						if (event.type === 'mousedown' || event.type === 'touchstart') {
							if (document) {
								$(document.body).addClass('xdsoft_noselect');
							}
							$([document.body, window]).on('touchend mouseup.xdsoft_scroller', function arguments_callee() {
								$([document.body, window]).off('touchend mouseup.xdsoft_scroller', arguments_callee)
									.off('mousemove.xdsoft_scroller', calcOffset)
									.removeClass('xdsoft_noselect');
							});
							$(document.body).on('mousemove.xdsoft_scroller', calcOffset);
						} else {
							touchStart = true;
							event.stopPropagation();
							event.preventDefault();
						}
					})
					.on('touchmove', function (event) {
						if (touchStart) {
							event.preventDefault();
							calcOffset(event);
						}
					})
					.on('touchend touchcancel', function () {
						touchStart =  false;
						startTopScroll = 0;
					});

				timeboxparent
					.on('scroll_element.xdsoft_scroller', function (event, percentage) {
						if (!parentHeight) {
							timeboxparent.trigger('resize_scroll.xdsoft_scroller', [percentage, true]);
						}
						percentage = percentage > 1 ? 1 : (percentage < 0 || isNaN(percentage)) ? 0 : percentage;

						scroller.css('margin-top', maximumOffset * percentage);

						setTimeout(function () {
							timebox.css('marginTop', -parseInt((timebox[0].offsetHeight - parentHeight) * percentage, 10));
						}, 10);
					})
					.on('resize_scroll.xdsoft_scroller', function (event, percentage, noTriggerScroll) {
						var percent, sh;
						parentHeight = timeboxparent[0].clientHeight;
						height = timebox[0].offsetHeight;
						percent = parentHeight / height;
						sh = percent * scrollbar[0].offsetHeight;
						if (percent > 1) {
							scroller.hide();
						} else {
							scroller.show();
							scroller.css('height', parseInt(sh > 10 ? sh : 10, 10));
							maximumOffset = scrollbar[0].offsetHeight - scroller[0].offsetHeight;
							if (noTriggerScroll !== true) {
								timeboxparent.trigger('scroll_element.xdsoft_scroller', [percentage || Math.abs(parseInt(timebox.css('marginTop'), 10)) / (height - parentHeight)]);
							}
						}
					});

				timeboxparent.on('mousewheel', function (event) {
					var top = Math.abs(parseInt(timebox.css('marginTop'), 10));

					top = top - (event.deltaY * 20);
					if (top < 0) {
						top = 0;
					}

					timeboxparent.trigger('scroll_element.xdsoft_scroller', [top / (height - parentHeight)]);
					event.stopPropagation();
					return false;
				});

				timeboxparent.on('touchstart', function (event) {
					start = pointerEventToXY(event);
					startTop = Math.abs(parseInt(timebox.css('marginTop'), 10));
				});

				timeboxparent.on('touchmove', function (event) {
					if (start) {
						event.preventDefault();
						var coord = pointerEventToXY(event);
						timeboxparent.trigger('scroll_element.xdsoft_scroller', [(startTop - (coord.y - start.y)) / (height - parentHeight)]);
					}
				});

				timeboxparent.on('touchend touchcancel', function () {
					start = false;
					startTop = 0;
				});
			}
			timeboxparent.trigger('resize_scroll.xdsoft_scroller', [percent]);
		});
	};

	$.fn.datetimepicker = function (opt, opt2) {
		var result = this,
			KEY0 = 48,
			KEY9 = 57,
			_KEY0 = 96,
			_KEY9 = 105,
			CTRLKEY = 17,
			DEL = 46,
			ENTER = 13,
			ESC = 27,
			BACKSPACE = 8,
			ARROWLEFT = 37,
			ARROWUP = 38,
			ARROWRIGHT = 39,
			ARROWDOWN = 40,
			TAB = 9,
			F5 = 116,
			AKEY = 65,
			CKEY = 67,
			VKEY = 86,
			ZKEY = 90,
			YKEY = 89,
			ctrlDown	=	false,
			options = ($.isPlainObject(opt) || !opt) ? $.extend(true, {}, default_options, opt) : $.extend(true, {}, default_options),

			lazyInitTimer = 0,
			createDateTimePicker,
			destroyDateTimePicker,

			lazyInit = function (input) {
				input
					.on('open.xdsoft focusin.xdsoft mousedown.xdsoft touchstart', function initOnActionCallback() {
						if (input.is(':disabled') || input.data('xdsoft_datetimepicker')) {
							return;
						}
						clearTimeout(lazyInitTimer);
						lazyInitTimer = setTimeout(function () {

							if (!input.data('xdsoft_datetimepicker')) {
								createDateTimePicker(input);
							}
							input
								.off('open.xdsoft focusin.xdsoft mousedown.xdsoft touchstart', initOnActionCallback)
								.trigger('open.xdsoft');
						}, 100);
					});
			};

		createDateTimePicker = function (input) {
			var datetimepicker = $('<div class="xdsoft_datetimepicker xdsoft_noselect"></div>'),
				xdsoft_copyright = $('<div class="xdsoft_copyright"><a target="_blank" href="http://xdsoft.net/jqplugins/datetimepicker/">xdsoft.net</a></div>'),
				datepicker = $('<div class="xdsoft_datepicker active"></div>'),
				month_picker = $('<div class="xdsoft_monthpicker"><button type="button" class="xdsoft_prev"></button><button type="button" class="xdsoft_today_button"></button>' +
					'<div class="xdsoft_label xdsoft_month"><span></span><i></i></div>' +
					'<div class="xdsoft_label xdsoft_year"><span></span><i></i></div>' +
					'<button type="button" class="xdsoft_next"></button></div>'),
				calendar = $('<div class="xdsoft_calendar"></div>'),
				timepicker = $('<div class="xdsoft_timepicker active"><button type="button" class="xdsoft_prev"></button><div class="xdsoft_time_box"></div><button type="button" class="xdsoft_next"></button></div>'),
				timeboxparent = timepicker.find('.xdsoft_time_box').eq(0),
				timebox = $('<div class="xdsoft_time_variant"></div>'),
				applyButton = $('<button type="button" class="xdsoft_save_selected blue-gradient-button">Save Selected</button>'),

				monthselect = $('<div class="xdsoft_select xdsoft_monthselect"><div></div></div>'),
				yearselect = $('<div class="xdsoft_select xdsoft_yearselect"><div></div></div>'),
				triggerAfterOpen = false,
				XDSoft_datetime,

				xchangeTimer,
				timerclick,
				current_time_index,
				setPos,
				timer = 0,
				_xdsoft_datetime,
				forEachAncestorOf,
				throttle;

			if (options.id) {
				datetimepicker.attr('id', options.id);
			}
			if (options.style) {
				datetimepicker.attr('style', options.style);
			}
			if (options.weeks) {
				datetimepicker.addClass('xdsoft_showweeks');
			}
			if (options.rtl) {
				datetimepicker.addClass('xdsoft_rtl');
			}

			datetimepicker.addClass('xdsoft_' + options.theme);
			datetimepicker.addClass(options.className);

			month_picker
				.find('.xdsoft_month span')
					.after(monthselect);
			month_picker
				.find('.xdsoft_year span')
					.after(yearselect);

			month_picker
				.find('.xdsoft_month,.xdsoft_year')
					.on('touchstart mousedown.xdsoft', function (event) {
					var select = $(this).find('.xdsoft_select').eq(0),
						val = 0,
						top = 0,
						visible = select.is(':visible'),
						items,
						i;

					month_picker
						.find('.xdsoft_select')
							.hide();
					if (_xdsoft_datetime.currentTime) {
						val = _xdsoft_datetime.currentTime[$(this).hasClass('xdsoft_month') ? 'getMonth' : 'getFullYear']();
					}

					select[visible ? 'hide' : 'show']();
					for (items = select.find('div.xdsoft_option'), i = 0; i < items.length; i += 1) {
						if (items.eq(i).data('value') === val) {
							break;
						} else {
							top += items[0].offsetHeight;
						}
					}

					select.xdsoftScroller(top / (select.children()[0].offsetHeight - (select[0].clientHeight)));
					event.stopPropagation();
					return false;
				});

			month_picker
				.find('.xdsoft_select')
					.xdsoftScroller()
				.on('touchstart mousedown.xdsoft', function (event) {
					event.stopPropagation();
					event.preventDefault();
				})
				.on('touchstart mousedown.xdsoft', '.xdsoft_option', function () {
					if (_xdsoft_datetime.currentTime === undefined || _xdsoft_datetime.currentTime === null) {
						_xdsoft_datetime.currentTime = _xdsoft_datetime.now();
					}

					var year = _xdsoft_datetime.currentTime.getFullYear();
					if (_xdsoft_datetime && _xdsoft_datetime.currentTime) {
						_xdsoft_datetime.currentTime[$(this).parent().parent().hasClass('xdsoft_monthselect') ? 'setMonth' : 'setFullYear']($(this).data('value'));
					}

					$(this).parent().parent().hide();

					datetimepicker.trigger('xchange.xdsoft');
					if (options.onChangeMonth && $.isFunction(options.onChangeMonth)) {
						options.onChangeMonth.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'));
					}

					if (year !== _xdsoft_datetime.currentTime.getFullYear() && $.isFunction(options.onChangeYear)) {
						options.onChangeYear.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'));
					}
				});

			datetimepicker.getValue = function () {
				return _xdsoft_datetime.getCurrentTime();
			};

			datetimepicker.setOptions = function (_options) {
				var highlightedDates = {};

				options = $.extend(true, {}, options, _options);

				if (_options.allowTimes && $.isArray(_options.allowTimes) && _options.allowTimes.length) {
					options.allowTimes = $.extend(true, [], _options.allowTimes);
				}

				if (_options.weekends && $.isArray(_options.weekends) && _options.weekends.length) {
					options.weekends = $.extend(true, [], _options.weekends);
				}

				if (_options.allowDates && $.isArray(_options.allowDates) && _options.allowDates.length) {
					options.allowDates = $.extend(true, [], _options.allowDates);
				}

				if (_options.allowDateRe && Object.prototype.toString.call(_options.allowDateRe)==="[object String]") {
					options.allowDateRe = new RegExp(_options.allowDateRe);
				}

				if (_options.highlightedDates && $.isArray(_options.highlightedDates) && _options.highlightedDates.length) {
					$.each(_options.highlightedDates, function (index, value) {
						var splitData = $.map(value.split(','), $.trim),
							exDesc,
							hDate = new HighlightedDate(dateHelper.parseDate(splitData[0], options.formatDate), splitData[1], splitData[2]), // date, desc, style
							keyDate = dateHelper.formatDate(hDate.date, options.formatDate);
						if (highlightedDates[keyDate] !== undefined) {
							exDesc = highlightedDates[keyDate].desc;
							if (exDesc && exDesc.length && hDate.desc && hDate.desc.length) {
								highlightedDates[keyDate].desc = exDesc + "\n" + hDate.desc;
							}
						} else {
							highlightedDates[keyDate] = hDate;
						}
					});

					options.highlightedDates = $.extend(true, [], highlightedDates);
				}

				if (_options.highlightedPeriods && $.isArray(_options.highlightedPeriods) && _options.highlightedPeriods.length) {
					highlightedDates = $.extend(true, [], options.highlightedDates);
					$.each(_options.highlightedPeriods, function (index, value) {
						var dateTest, // start date
							dateEnd,
							desc,
							hDate,
							keyDate,
							exDesc,
							style;
						if ($.isArray(value)) {
							dateTest = value[0];
							dateEnd = value[1];
							desc = value[2];
							style = value[3];
						}
						else {
							var splitData = $.map(value.split(','), $.trim);
							dateTest = dateHelper.parseDate(splitData[0], options.formatDate);
							dateEnd = dateHelper.parseDate(splitData[1], options.formatDate);
							desc = splitData[2];
							style = splitData[3];
						}

						while (dateTest <= dateEnd) {
							hDate = new HighlightedDate(dateTest, desc, style);
							keyDate = dateHelper.formatDate(dateTest, options.formatDate);
							dateTest.setDate(dateTest.getDate() + 1);
							if (highlightedDates[keyDate] !== undefined) {
								exDesc = highlightedDates[keyDate].desc;
								if (exDesc && exDesc.length && hDate.desc && hDate.desc.length) {
									highlightedDates[keyDate].desc = exDesc + "\n" + hDate.desc;
								}
							} else {
								highlightedDates[keyDate] = hDate;
							}
						}
					});

					options.highlightedDates = $.extend(true, [], highlightedDates);
				}

				if (_options.disabledDates && $.isArray(_options.disabledDates) && _options.disabledDates.length) {
					options.disabledDates = $.extend(true, [], _options.disabledDates);
				}

				if (_options.disabledWeekDays && $.isArray(_options.disabledWeekDays) && _options.disabledWeekDays.length) {
					options.disabledWeekDays = $.extend(true, [], _options.disabledWeekDays);
				}

				if ((options.open || options.opened) && (!options.inline)) {
					input.trigger('open.xdsoft');
				}

				if (options.inline) {
					triggerAfterOpen = true;
					datetimepicker.addClass('xdsoft_inline');
					input.after(datetimepicker).hide();
				}

				if (options.inverseButton) {
					options.next = 'xdsoft_prev';
					options.prev = 'xdsoft_next';
				}

				if (options.datepicker) {
					datepicker.addClass('active');
				} else {
					datepicker.removeClass('active');
				}

				if (options.timepicker) {
					timepicker.addClass('active');
				} else {
					timepicker.removeClass('active');
				}

				if (options.value) {
					_xdsoft_datetime.setCurrentTime(options.value);
					if (input && input.val) {
						input.val(_xdsoft_datetime.str);
					}
				}

				if (isNaN(options.dayOfWeekStart)) {
					options.dayOfWeekStart = 0;
				} else {
					options.dayOfWeekStart = parseInt(options.dayOfWeekStart, 10) % 7;
				}

				if (!options.timepickerScrollbar) {
					timeboxparent.xdsoftScroller('hide');
				}

				if (options.minDate && /^[\+\-](.*)$/.test(options.minDate)) {
					options.minDate = dateHelper.formatDate(_xdsoft_datetime.strToDateTime(options.minDate), options.formatDate);
				}

				if (options.maxDate &&  /^[\+\-](.*)$/.test(options.maxDate)) {
					options.maxDate = dateHelper.formatDate(_xdsoft_datetime.strToDateTime(options.maxDate), options.formatDate);
				}

				applyButton.toggle(options.showApplyButton);

				month_picker
					.find('.xdsoft_today_button')
						.css('visibility', !options.todayButton ? 'hidden' : 'visible');

				month_picker
					.find('.' + options.prev)
						.css('visibility', !options.prevButton ? 'hidden' : 'visible');

				month_picker
					.find('.' + options.next)
						.css('visibility', !options.nextButton ? 'hidden' : 'visible');

				setMask(options);

				if (options.validateOnBlur) {
					input
						.off('blur.xdsoft')
						.on('blur.xdsoft', function () {
							if (options.allowBlank && (!$.trim($(this).val()).length || (typeof options.mask == "string" && $.trim($(this).val()) === options.mask.replace(/[0-9]/g, '_')))) {
								$(this).val(null);
								datetimepicker.data('xdsoft_datetime').empty();
							} else {
								var d = dateHelper.parseDate($(this).val(), options.format);
								if (d) { // parseDate() may skip some invalid parts like date or time, so make it clear for user: show parsed date/time
									$(this).val(dateHelper.formatDate(d, options.format));
								} else {
									var splittedHours   = +([$(this).val()[0], $(this).val()[1]].join('')),
										splittedMinutes = +([$(this).val()[2], $(this).val()[3]].join(''));
	
									// parse the numbers as 0312 => 03:12
									if (!options.datepicker && options.timepicker && splittedHours >= 0 && splittedHours < 24 && splittedMinutes >= 0 && splittedMinutes < 60) {
										$(this).val([splittedHours, splittedMinutes].map(function (item) {
											return item > 9 ? item : '0' + item;
										}).join(':'));
									} else {
										$(this).val(dateHelper.formatDate(_xdsoft_datetime.now(), options.format));
									}
								}
								datetimepicker.data('xdsoft_datetime').setCurrentTime($(this).val());
							}

							datetimepicker.trigger('changedatetime.xdsoft');
							datetimepicker.trigger('close.xdsoft');
						});
				}
				options.dayOfWeekStartPrev = (options.dayOfWeekStart === 0) ? 6 : options.dayOfWeekStart - 1;

				datetimepicker
					.trigger('xchange.xdsoft')
					.trigger('afterOpen.xdsoft');
			};

			datetimepicker
				.data('options', options)
				.on('touchstart mousedown.xdsoft', function (event) {
					event.stopPropagation();
					event.preventDefault();
					yearselect.hide();
					monthselect.hide();
					return false;
				});

			//scroll_element = timepicker.find('.xdsoft_time_box');
			timeboxparent.append(timebox);
			timeboxparent.xdsoftScroller();

			datetimepicker.on('afterOpen.xdsoft', function () {
				timeboxparent.xdsoftScroller();
			});

			datetimepicker
				.append(datepicker)
				.append(timepicker);

			if (options.withoutCopyright !== true) {
				datetimepicker
					.append(xdsoft_copyright);
			}

			datepicker
				.append(month_picker)
				.append(calendar)
				.append(applyButton);

			$(options.parentID)
				.append(datetimepicker);

			XDSoft_datetime = function () {
				var _this = this;
				_this.now = function (norecursion) {
					var d = new Date(),
						date,
						time;

					if (!norecursion && options.defaultDate) {
						date = _this.strToDateTime(options.defaultDate);
						d.setFullYear(date.getFullYear());
						d.setMonth(date.getMonth());
						d.setDate(date.getDate());
					}

					if (options.yearOffset) {
						d.setFullYear(d.getFullYear() + options.yearOffset);
					}

					if (!norecursion && options.defaultTime) {
						time = _this.strtotime(options.defaultTime);
						d.setHours(time.getHours());
						d.setMinutes(time.getMinutes());
					}
					return d;
				};

				_this.isValidDate = function (d) {
					if (Object.prototype.toString.call(d) !== "[object Date]") {
						return false;
					}
					return !isNaN(d.getTime());
				};

				_this.setCurrentTime = function (dTime, requireValidDate) {
					if (typeof dTime === 'string') {
						_this.currentTime = _this.strToDateTime(dTime);
					}
					else if (_this.isValidDate(dTime)) {
						_this.currentTime = dTime;
					}
					else if (!dTime && !requireValidDate && options.allowBlank) {
						_this.currentTime = null;
					}
					else {
						_this.currentTime = _this.now();
					}
					
					datetimepicker.trigger('xchange.xdsoft');
				};

				_this.empty = function () {
					_this.currentTime = null;
				};

				_this.getCurrentTime = function (dTime) {
					return _this.currentTime;
				};

				_this.nextMonth = function () {

					if (_this.currentTime === undefined || _this.currentTime === null) {
						_this.currentTime = _this.now();
					}

					var month = _this.currentTime.getMonth() + 1,
						year;
					if (month === 12) {
						_this.currentTime.setFullYear(_this.currentTime.getFullYear() + 1);
						month = 0;
					}

					year = _this.currentTime.getFullYear();

					_this.currentTime.setDate(
						Math.min(
							new Date(_this.currentTime.getFullYear(), month + 1, 0).getDate(),
							_this.currentTime.getDate()
						)
					);
					_this.currentTime.setMonth(month);

					if (options.onChangeMonth && $.isFunction(options.onChangeMonth)) {
						options.onChangeMonth.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'));
					}

					if (year !== _this.currentTime.getFullYear() && $.isFunction(options.onChangeYear)) {
						options.onChangeYear.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'));
					}

					datetimepicker.trigger('xchange.xdsoft');
					return month;
				};

				_this.prevMonth = function () {

					if (_this.currentTime === undefined || _this.currentTime === null) {
						_this.currentTime = _this.now();
					}

					var month = _this.currentTime.getMonth() - 1;
					if (month === -1) {
						_this.currentTime.setFullYear(_this.currentTime.getFullYear() - 1);
						month = 11;
					}
					_this.currentTime.setDate(
						Math.min(
							new Date(_this.currentTime.getFullYear(), month + 1, 0).getDate(),
							_this.currentTime.getDate()
						)
					);
					_this.currentTime.setMonth(month);
					if (options.onChangeMonth && $.isFunction(options.onChangeMonth)) {
						options.onChangeMonth.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'));
					}
					datetimepicker.trigger('xchange.xdsoft');
					return month;
				};

				_this.getWeekOfYear = function (datetime) {
					if (options.onGetWeekOfYear && $.isFunction(options.onGetWeekOfYear)) {
						var week = options.onGetWeekOfYear.call(datetimepicker, datetime);
						if (typeof week !== 'undefined') {
							return week;
						}
					}
					var onejan = new Date(datetime.getFullYear(), 0, 1);
					//First week of the year is th one with the first Thursday according to ISO8601
					if(onejan.getDay()!=4)
						onejan.setMonth(0, 1 + ((4 - onejan.getDay()+ 7) % 7));
					return Math.ceil((((datetime - onejan) / 86400000) + onejan.getDay() + 1) / 7);
				};

				_this.strToDateTime = function (sDateTime) {
					var tmpDate = [], timeOffset, currentTime;

					if (sDateTime && sDateTime instanceof Date && _this.isValidDate(sDateTime)) {
						return sDateTime;
					}

					tmpDate = /^(\+|\-)(.*)$/.exec(sDateTime);
					if (tmpDate) {
						tmpDate[2] = dateHelper.parseDate(tmpDate[2], options.formatDate);
					}
					if (tmpDate  && tmpDate[2]) {
						timeOffset = tmpDate[2].getTime() - (tmpDate[2].getTimezoneOffset()) * 60000;
						currentTime = new Date((_this.now(true)).getTime() + parseInt(tmpDate[1] + '1', 10) * timeOffset);
					} else {
						currentTime = sDateTime ? dateHelper.parseDate(sDateTime, options.format) : _this.now();
					}

					if (!_this.isValidDate(currentTime)) {
						currentTime = _this.now();
					}

					return currentTime;
				};

				_this.strToDate = function (sDate) {
					if (sDate && sDate instanceof Date && _this.isValidDate(sDate)) {
						return sDate;
					}

					var currentTime = sDate ? dateHelper.parseDate(sDate, options.formatDate) : _this.now(true);
					if (!_this.isValidDate(currentTime)) {
						currentTime = _this.now(true);
					}
					return currentTime;
				};

				_this.strtotime = function (sTime) {
					if (sTime && sTime instanceof Date && _this.isValidDate(sTime)) {
						return sTime;
					}
					var currentTime = sTime ? dateHelper.parseDate(sTime, options.formatTime) : _this.now(true);
					if (!_this.isValidDate(currentTime)) {
						currentTime = _this.now(true);
					}
					return currentTime;
				};

				_this.str = function () {
					return dateHelper.formatDate(_this.currentTime, options.format);
				};
				_this.currentTime = this.now();
			};

			_xdsoft_datetime = new XDSoft_datetime();

			applyButton.on('touchend click', function (e) {//pathbrite
				e.preventDefault();
				datetimepicker.data('changed', true);
				_xdsoft_datetime.setCurrentTime(getCurrentValue());
				input.val(_xdsoft_datetime.str());
				datetimepicker.trigger('close.xdsoft');
			});
			month_picker
				.find('.xdsoft_today_button')
				.on('touchend mousedown.xdsoft', function () {
					datetimepicker.data('changed', true);
					_xdsoft_datetime.setCurrentTime(0, true);
					datetimepicker.trigger('afterOpen.xdsoft');
				}).on('dblclick.xdsoft', function () {
					var currentDate = _xdsoft_datetime.getCurrentTime(), minDate, maxDate;
					currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
					minDate = _xdsoft_datetime.strToDate(options.minDate);
					minDate = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
					if (currentDate < minDate) {
						return;
					}
					maxDate = _xdsoft_datetime.strToDate(options.maxDate);
					maxDate = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate());
					if (currentDate > maxDate) {
						return;
					}
					input.val(_xdsoft_datetime.str());
					input.trigger('change');
					datetimepicker.trigger('close.xdsoft');
				});
			month_picker
				.find('.xdsoft_prev,.xdsoft_next')
				.on('touchend mousedown.xdsoft', function () {
					var $this = $(this),
						timer = 0,
						stop = false;

					(function arguments_callee1(v) {
						if ($this.hasClass(options.next)) {
							_xdsoft_datetime.nextMonth();
						} else if ($this.hasClass(options.prev)) {
							_xdsoft_datetime.prevMonth();
						}
						if (options.monthChangeSpinner) {
							if (!stop) {
								timer = setTimeout(arguments_callee1, v || 100);
							}
						}
					}(500));

					$([document.body, window]).on('touchend mouseup.xdsoft', function arguments_callee2() {
						clearTimeout(timer);
						stop = true;
						$([document.body, window]).off('touchend mouseup.xdsoft', arguments_callee2);
					});
				});

			timepicker
				.find('.xdsoft_prev,.xdsoft_next')
				.on('touchend mousedown.xdsoft', function () {
					var $this = $(this),
						timer = 0,
						stop = false,
						period = 110;
					(function arguments_callee4(v) {
						var pheight = timeboxparent[0].clientHeight,
							height = timebox[0].offsetHeight,
							top = Math.abs(parseInt(timebox.css('marginTop'), 10));
						if ($this.hasClass(options.next) && (height - pheight) - options.timeHeightInTimePicker >= top) {
							timebox.css('marginTop', '-' + (top + options.timeHeightInTimePicker) + 'px');
						} else if ($this.hasClass(options.prev) && top - options.timeHeightInTimePicker >= 0) {
							timebox.css('marginTop', '-' + (top - options.timeHeightInTimePicker) + 'px');
						}
                        /**
                         * Fixed bug:
                         * When using css3 transition, it will cause a bug that you cannot scroll the timepicker list.
                         * The reason is that the transition-duration time, if you set it to 0, all things fine, otherwise, this
                         * would cause a bug when you use jquery.css method.
                         * Let's say: * { transition: all .5s ease; }
                         * jquery timebox.css('marginTop') will return the original value which is before you clicking the next/prev button,
                         * meanwhile the timebox[0].style.marginTop will return the right value which is after you clicking the
                         * next/prev button.
                         * 
                         * What we should do:
                         * Replace timebox.css('marginTop') with timebox[0].style.marginTop.
                         */
                        timeboxparent.trigger('scroll_element.xdsoft_scroller', [Math.abs(parseInt(timebox[0].style.marginTop, 10) / (height - pheight))]);
						period = (period > 10) ? 10 : period - 10;
						if (!stop) {
							timer = setTimeout(arguments_callee4, v || period);
						}
					}(500));
					$([document.body, window]).on('touchend mouseup.xdsoft', function arguments_callee5() {
						clearTimeout(timer);
						stop = true;
						$([document.body, window])
							.off('touchend mouseup.xdsoft', arguments_callee5);
					});
				});

			xchangeTimer = 0;
			// base handler - generating a calendar and timepicker
			datetimepicker
				.on('xchange.xdsoft', function (event) {
					clearTimeout(xchangeTimer);
					xchangeTimer = setTimeout(function () {

						if (_xdsoft_datetime.currentTime === undefined || _xdsoft_datetime.currentTime === null) {
							//In case blanks are allowed, delay construction until we have a valid date 
							if (options.allowBlank)
								return;
								
							_xdsoft_datetime.currentTime = _xdsoft_datetime.now();
						}

						var table =	'',
							start = new Date(_xdsoft_datetime.currentTime.getFullYear(), _xdsoft_datetime.currentTime.getMonth(), 1, 12, 0, 0),
							i = 0,
							j,
							today = _xdsoft_datetime.now(),
							maxDate = false,
							minDate = false,
							hDate,
							day,
							d,
							y,
							m,
							w,
							classes = [],
							customDateSettings,
							newRow = true,
							time = '',
							h = '',
							line_time,
							description;

						while (start.getDay() !== options.dayOfWeekStart) {
							start.setDate(start.getDate() - 1);
						}

						table += '<table><thead><tr>';

						if (options.weeks) {
							table += '<th></th>';
						}

						for (j = 0; j < 7; j += 1) {
							table += '<th>' + options.i18n[globalLocale].dayOfWeekShort[(j + options.dayOfWeekStart) % 7] + '</th>';
						}

						table += '</tr></thead>';
						table += '<tbody>';

						if (options.maxDate !== false) {
							maxDate = _xdsoft_datetime.strToDate(options.maxDate);
							maxDate = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate(), 23, 59, 59, 999);
						}

						if (options.minDate !== false) {
							minDate = _xdsoft_datetime.strToDate(options.minDate);
							minDate = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
						}

						while (i < _xdsoft_datetime.currentTime.countDaysInMonth() || start.getDay() !== options.dayOfWeekStart || _xdsoft_datetime.currentTime.getMonth() === start.getMonth()) {
							classes = [];
							i += 1;

							day = start.getDay();
							d = start.getDate();
							y = start.getFullYear();
							m = start.getMonth();
							w = _xdsoft_datetime.getWeekOfYear(start);
							description = '';

							classes.push('xdsoft_date');

							if (options.beforeShowDay && $.isFunction(options.beforeShowDay.call)) {
								customDateSettings = options.beforeShowDay.call(datetimepicker, start);
							} else {
								customDateSettings = null;
							}

							if(options.allowDateRe && Object.prototype.toString.call(options.allowDateRe) === "[object RegExp]"){
								if(!options.allowDateRe.test(dateHelper.formatDate(start, options.formatDate))){
									classes.push('xdsoft_disabled');
								}
							} else if(options.allowDates && options.allowDates.length>0){
								if(options.allowDates.indexOf(dateHelper.formatDate(start, options.formatDate)) === -1){
									classes.push('xdsoft_disabled');
								}
							} else if ((maxDate !== false && start > maxDate) || (minDate !== false && start < minDate) || (customDateSettings && customDateSettings[0] === false)) {
								classes.push('xdsoft_disabled');
							} else if (options.disabledDates.indexOf(dateHelper.formatDate(start, options.formatDate)) !== -1) {
								classes.push('xdsoft_disabled');
							} else if (options.disabledWeekDays.indexOf(day) !== -1) {
								classes.push('xdsoft_disabled');
							}else if (input.is('[readonly]')) {
								classes.push('xdsoft_disabled');
							}

							if (customDateSettings && customDateSettings[1] !== "") {
								classes.push(customDateSettings[1]);
							}

							if (_xdsoft_datetime.currentTime.getMonth() !== m) {
								classes.push('xdsoft_other_month');
							}

							if ((options.defaultSelect || datetimepicker.data('changed')) && dateHelper.formatDate(_xdsoft_datetime.currentTime, options.formatDate) === dateHelper.formatDate(start, options.formatDate)) {
								classes.push('xdsoft_current');
							}

							if (dateHelper.formatDate(today, options.formatDate) === dateHelper.formatDate(start, options.formatDate)) {
								classes.push('xdsoft_today');
							}

							if (start.getDay() === 0 || start.getDay() === 6 || options.weekends.indexOf(dateHelper.formatDate(start, options.formatDate)) !== -1) {
								classes.push('xdsoft_weekend');
							}

							if (options.highlightedDates[dateHelper.formatDate(start, options.formatDate)] !== undefined) {
								hDate = options.highlightedDates[dateHelper.formatDate(start, options.formatDate)];
								classes.push(hDate.style === undefined ? 'xdsoft_highlighted_default' : hDate.style);
								description = hDate.desc === undefined ? '' : hDate.desc;
							}

							if (options.beforeShowDay && $.isFunction(options.beforeShowDay)) {
								classes.push(options.beforeShowDay(start));
							}

							if (newRow) {
								table += '<tr>';
								newRow = false;
								if (options.weeks) {
									table += '<th>' + w + '</th>';
								}
							}

							table += '<td data-date="' + d + '" data-month="' + m + '" data-year="' + y + '"' + ' class="xdsoft_date xdsoft_day_of_week' + start.getDay() + ' ' + classes.join(' ') + '" title="' + description + '">' +
										'<div>' + d + '</div>' +
									'</td>';

							if (start.getDay() === options.dayOfWeekStartPrev) {
								table += '</tr>';
								newRow = true;
							}

							start.setDate(d + 1);
						}
						table += '</tbody></table>';

						calendar.html(table);

						month_picker.find('.xdsoft_label span').eq(0).text(options.i18n[globalLocale].months[_xdsoft_datetime.currentTime.getMonth()]);
						month_picker.find('.xdsoft_label span').eq(1).text(_xdsoft_datetime.currentTime.getFullYear());

						// generate timebox
						time = '';
						h = '';
						m = '';

						line_time = function line_time(h, m) {
							var now = _xdsoft_datetime.now(), optionDateTime, current_time,
								isALlowTimesInit = options.allowTimes && $.isArray(options.allowTimes) && options.allowTimes.length;
							now.setHours(h);
							h = parseInt(now.getHours(), 10);
							now.setMinutes(m);
							m = parseInt(now.getMinutes(), 10);
							optionDateTime = new Date(_xdsoft_datetime.currentTime);
							optionDateTime.setHours(h);
							optionDateTime.setMinutes(m);
							classes = [];			
							if ((options.minDateTime !== false && options.minDateTime > optionDateTime) || (options.maxTime !== false && _xdsoft_datetime.strtotime(options.maxTime).getTime() < now.getTime()) || (options.minTime !== false && _xdsoft_datetime.strtotime(options.minTime).getTime() > now.getTime())) {
								classes.push('xdsoft_disabled');
							} else if ((options.minDateTime !== false && options.minDateTime > optionDateTime) || ((options.disabledMinTime !== false && now.getTime() > _xdsoft_datetime.strtotime(options.disabledMinTime).getTime()) && (options.disabledMaxTime !== false && now.getTime() < _xdsoft_datetime.strtotime(options.disabledMaxTime).getTime()))) {
								classes.push('xdsoft_disabled');
							} else if (input.is('[readonly]')) {
								classes.push('xdsoft_disabled');
							}

							current_time = new Date(_xdsoft_datetime.currentTime);
							current_time.setHours(parseInt(_xdsoft_datetime.currentTime.getHours(), 10));

							if (!isALlowTimesInit) {
								current_time.setMinutes(Math[options.roundTime](_xdsoft_datetime.currentTime.getMinutes() / options.step) * options.step);
							}

							if ((options.initTime || options.defaultSelect || datetimepicker.data('changed')) && current_time.getHours() === parseInt(h, 10) && ((!isALlowTimesInit && options.step > 59) || current_time.getMinutes() === parseInt(m, 10))) {
								if (options.defaultSelect || datetimepicker.data('changed')) {
									classes.push('xdsoft_current');
								} else if (options.initTime) {
									classes.push('xdsoft_init_time');
								}
							}
							if (parseInt(today.getHours(), 10) === parseInt(h, 10) && parseInt(today.getMinutes(), 10) === parseInt(m, 10)) {
								classes.push('xdsoft_today');
							}
							time += '<div class="xdsoft_time ' + classes.join(' ') + '" data-hour="' + h + '" data-minute="' + m + '">' + dateHelper.formatDate(now, options.formatTime) + '</div>';
						};

						if (!options.allowTimes || !$.isArray(options.allowTimes) || !options.allowTimes.length) {
							for (i = 0, j = 0; i < (options.hours12 ? 12 : 24); i += 1) {
								for (j = 0; j < 60; j += options.step) {
									h = (i < 10 ? '0' : '') + i;
									m = (j < 10 ? '0' : '') + j;
									line_time(h, m);
								}
							}
						} else {
							for (i = 0; i < options.allowTimes.length; i += 1) {
								h = _xdsoft_datetime.strtotime(options.allowTimes[i]).getHours();
								m = _xdsoft_datetime.strtotime(options.allowTimes[i]).getMinutes();
								line_time(h, m);
							}
						}

						timebox.html(time);

						opt = '';
						i = 0;

						for (i = parseInt(options.yearStart, 10) + options.yearOffset; i <= parseInt(options.yearEnd, 10) + options.yearOffset; i += 1) {
							opt += '<div class="xdsoft_option ' + (_xdsoft_datetime.currentTime.getFullYear() === i ? 'xdsoft_current' : '') + '" data-value="' + i + '">' + i + '</div>';
						}
						yearselect.children().eq(0)
												.html(opt);

						for (i = parseInt(options.monthStart, 10), opt = ''; i <= parseInt(options.monthEnd, 10); i += 1) {
							opt += '<div class="xdsoft_option ' + (_xdsoft_datetime.currentTime.getMonth() === i ? 'xdsoft_current' : '') + '" data-value="' + i + '">' + options.i18n[globalLocale].months[i] + '</div>';
						}
						monthselect.children().eq(0).html(opt);
						$(datetimepicker)
							.trigger('generate.xdsoft');
					}, 10);
					event.stopPropagation();
				})
				.on('afterOpen.xdsoft', function () {
					if (options.timepicker) {
						var classType, pheight, height, top;
						if (timebox.find('.xdsoft_current').length) {
							classType = '.xdsoft_current';
						} else if (timebox.find('.xdsoft_init_time').length) {
							classType = '.xdsoft_init_time';
						}
						if (classType) {
							pheight = timeboxparent[0].clientHeight;
							height = timebox[0].offsetHeight;
							top = timebox.find(classType).index() * options.timeHeightInTimePicker + 1;
							if ((height - pheight) < top) {
								top = height - pheight;
							}
							timeboxparent.trigger('scroll_element.xdsoft_scroller', [parseInt(top, 10) / (height - pheight)]);
						} else {
							timeboxparent.trigger('scroll_element.xdsoft_scroller', [0]);
						}
					}
				});

			timerclick = 0;
			calendar
				.on('touchend click.xdsoft', 'td', function (xdevent) {
					xdevent.stopPropagation();  // Prevents closing of Pop-ups, Modals and Flyouts in Bootstrap
					timerclick += 1;
					var $this = $(this),
						currentTime = _xdsoft_datetime.currentTime;

					if (currentTime === undefined || currentTime === null) {
						_xdsoft_datetime.currentTime = _xdsoft_datetime.now();
						currentTime = _xdsoft_datetime.currentTime;
					}

					if ($this.hasClass('xdsoft_disabled')) {
						return false;
					}

					currentTime.setDate(1);
					currentTime.setFullYear($this.data('year'));
					currentTime.setMonth($this.data('month'));
					currentTime.setDate($this.data('date'));

					datetimepicker.trigger('select.xdsoft', [currentTime]);

					input.val(_xdsoft_datetime.str());

					if (options.onSelectDate &&	$.isFunction(options.onSelectDate)) {
						options.onSelectDate.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'), xdevent);
					}

					datetimepicker.data('changed', true);
					datetimepicker.trigger('xchange.xdsoft');
					datetimepicker.trigger('changedatetime.xdsoft');
					if ((timerclick > 1 || (options.closeOnDateSelect === true || (options.closeOnDateSelect === false && !options.timepicker))) && !options.inline) {
						datetimepicker.trigger('close.xdsoft');
					}
					setTimeout(function () {
						timerclick = 0;
					}, 200);
				});

			timebox
				.on('touchmove', 'div', function () { currentlyScrollingTimeDiv = true; })
				.on('touchend click.xdsoft', 'div', function (xdevent) {
					xdevent.stopPropagation();
					if (currentlyScrollingTimeDiv) {
				        	currentlyScrollingTimeDiv = false;
				        	return;
				    	}
					var $this = $(this),
						currentTime = _xdsoft_datetime.currentTime;

					if (currentTime === undefined || currentTime === null) {
						_xdsoft_datetime.currentTime = _xdsoft_datetime.now();
						currentTime = _xdsoft_datetime.currentTime;
					}

					if ($this.hasClass('xdsoft_disabled')) {
						return false;
					}
					currentTime.setHours($this.data('hour'));
					currentTime.setMinutes($this.data('minute'));
					datetimepicker.trigger('select.xdsoft', [currentTime]);

					datetimepicker.data('input').val(_xdsoft_datetime.str());

					if (options.onSelectTime && $.isFunction(options.onSelectTime)) {
						options.onSelectTime.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'), xdevent);
					}
					datetimepicker.data('changed', true);
					datetimepicker.trigger('xchange.xdsoft');
					datetimepicker.trigger('changedatetime.xdsoft');
					if (options.inline !== true && options.closeOnTimeSelect === true) {
						datetimepicker.trigger('close.xdsoft');
					}
				});

			datepicker
				.on('mousewheel.xdsoft', function (event) {
					if (!options.scrollMonth) {
						return true;
					}
					if (event.deltaY < 0) {
						_xdsoft_datetime.nextMonth();
					} else {
						_xdsoft_datetime.prevMonth();
					}
					return false;
				});

			input
				.on('mousewheel.xdsoft', function (event) {
					if (!options.scrollInput) {
						return true;
					}
					if (!options.datepicker && options.timepicker) {
						current_time_index = timebox.find('.xdsoft_current').length ? timebox.find('.xdsoft_current').eq(0).index() : 0;
						if (current_time_index + event.deltaY >= 0 && current_time_index + event.deltaY < timebox.children().length) {
							current_time_index += event.deltaY;
						}
						if (timebox.children().eq(current_time_index).length) {
							timebox.children().eq(current_time_index).trigger('mousedown');
						}
						return false;
					}
					if (options.datepicker && !options.timepicker) {
						datepicker.trigger(event, [event.deltaY, event.deltaX, event.deltaY]);
						if (input.val) {
							input.val(_xdsoft_datetime.str());
						}
						datetimepicker.trigger('changedatetime.xdsoft');
						return false;
					}
				});

			datetimepicker
				.on('changedatetime.xdsoft', function (event) {
					if (options.onChangeDateTime && $.isFunction(options.onChangeDateTime)) {
						var $input = datetimepicker.data('input');
						options.onChangeDateTime.call(datetimepicker, _xdsoft_datetime.currentTime, $input, event);
						delete options.value;
						$input.trigger('change');
					}
				})
				.on('generate.xdsoft', function () {
					if (options.onGenerate && $.isFunction(options.onGenerate)) {
						options.onGenerate.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'));
					}
					if (triggerAfterOpen) {
						datetimepicker.trigger('afterOpen.xdsoft');
						triggerAfterOpen = false;
					}
				})
				.on('click.xdsoft', function (xdevent) {
					xdevent.stopPropagation();
				});

			current_time_index = 0;

			/**
			 * Runs the callback for each of the specified node's ancestors.
			 *
			 * Return FALSE from the callback to stop ascending.
			 *
			 * @param {DOMNode} node
			 * @param {Function} callback
			 * @returns {undefined}
			 */
			forEachAncestorOf = function (node, callback) {
				do {
					node = node.parentNode;

					if (callback(node) === false) {
						break;
					}
				} while (node.nodeName !== 'HTML');
			};

			/**
			 * Sets the position of the picker.
			 *
			 * @returns {undefined}
			 */
			setPos = function () {
				var dateInputOffset,
					dateInputElem,
					verticalPosition,
					left,
					position,
					datetimepickerElem,
					dateInputHasFixedAncestor,
					$dateInput,
					windowWidth,
					verticalAnchorEdge,
					datetimepickerCss,
					windowHeight,
					windowScrollTop;

				$dateInput = datetimepicker.data('input');
				dateInputOffset = $dateInput.offset();
				dateInputElem = $dateInput[0];

				verticalAnchorEdge = 'top';
				verticalPosition = (dateInputOffset.top + dateInputElem.offsetHeight) - 1;
				left = dateInputOffset.left;
				position = "absolute";

				windowWidth = $(window).width();
				windowHeight = $(window).height();
				windowScrollTop = $(window).scrollTop();

				if ((document.documentElement.clientWidth - dateInputOffset.left) < datepicker.parent().outerWidth(true)) {
					var diff = datepicker.parent().outerWidth(true) - dateInputElem.offsetWidth;
					left = left - diff;
				}

				if ($dateInput.parent().css('direction') === 'rtl') {
					left -= (datetimepicker.outerWidth() - $dateInput.outerWidth());
				}

				if (options.fixed) {
					verticalPosition -= windowScrollTop;
					left -= $(window).scrollLeft();
					position = "fixed";
				} else {
					dateInputHasFixedAncestor = false;

					forEachAncestorOf(dateInputElem, function (ancestorNode) {
						if (window.getComputedStyle(ancestorNode).getPropertyValue('position') === 'fixed') {
							dateInputHasFixedAncestor = true;
							return false;
						}
					});

					if (dateInputHasFixedAncestor) {
						position = 'fixed';

						//If the picker won't fit entirely within the viewport then display it above the date input.
						if (verticalPosition + datetimepicker.outerHeight() > windowHeight + windowScrollTop) {
							verticalAnchorEdge = 'bottom';
							verticalPosition = (windowHeight + windowScrollTop) - dateInputOffset.top;
						} else {
							verticalPosition -= windowScrollTop;
						}
					} else {
						if (verticalPosition + dateInputElem.offsetHeight > windowHeight + windowScrollTop) {
							verticalPosition = dateInputOffset.top - dateInputElem.offsetHeight + 1;
						}
					}

					if (verticalPosition < 0) {
						verticalPosition = 0;
					}

					if (left + dateInputElem.offsetWidth > windowWidth) {
						left = windowWidth - dateInputElem.offsetWidth;
					}
				}

				datetimepickerElem = datetimepicker[0];

				forEachAncestorOf(datetimepickerElem, function (ancestorNode) {
					var ancestorNodePosition;

					ancestorNodePosition = window.getComputedStyle(ancestorNode).getPropertyValue('position');

					if (ancestorNodePosition === 'relative' && windowWidth >= ancestorNode.offsetWidth) {
						left = left - ((windowWidth - ancestorNode.offsetWidth) / 2);
						return false;
					}
				});

				datetimepickerCss = {
					position: position,
					left: left,
					top: '',  //Initialize to prevent previous values interfering with new ones.
					bottom: ''  //Initialize to prevent previous values interfering with new ones.
				};

				datetimepickerCss[verticalAnchorEdge] = verticalPosition;

				datetimepicker.css(datetimepickerCss);
			};

			datetimepicker
				.on('open.xdsoft', function (event) {
					var onShow = true;
					if (options.onShow && $.isFunction(options.onShow)) {
						onShow = options.onShow.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'), event);
					}
					if (onShow !== false) {
						datetimepicker.show();
						setPos();
						$(window)
							.off('resize.xdsoft', setPos)
							.on('resize.xdsoft', setPos);

						if (options.closeOnWithoutClick) {
							$([document.body, window]).on('touchstart mousedown.xdsoft', function arguments_callee6() {
								datetimepicker.trigger('close.xdsoft');
								$([document.body, window]).off('touchstart mousedown.xdsoft', arguments_callee6);
							});
						}
					}
				})
				.on('close.xdsoft', function (event) {
					var onClose = true;
					month_picker
						.find('.xdsoft_month,.xdsoft_year')
							.find('.xdsoft_select')
								.hide();
					if (options.onClose && $.isFunction(options.onClose)) {
						onClose = options.onClose.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'), event);
					}
					if (onClose !== false && !options.opened && !options.inline) {
						datetimepicker.hide();
					}
					event.stopPropagation();
				})
				.on('toggle.xdsoft', function () {
					if (datetimepicker.is(':visible')) {
						datetimepicker.trigger('close.xdsoft');
					} else {
						datetimepicker.trigger('open.xdsoft');
					}
				})
				.data('input', input);

			timer = 0;

			datetimepicker.data('xdsoft_datetime', _xdsoft_datetime);
			datetimepicker.setOptions(options);

			function getCurrentValue() {
				var ct = false, time;

				if (options.startDate) {
					ct = _xdsoft_datetime.strToDate(options.startDate);
				} else {
					ct = options.value || ((input && input.val && input.val()) ? input.val() : '');
					if (ct) {
						ct = _xdsoft_datetime.strToDateTime(ct);
					} else if (options.defaultDate) {
						ct = _xdsoft_datetime.strToDateTime(options.defaultDate);
						if (options.defaultTime) {
							time = _xdsoft_datetime.strtotime(options.defaultTime);
							ct.setHours(time.getHours());
							ct.setMinutes(time.getMinutes());
						}
					}
				}

				if (ct && _xdsoft_datetime.isValidDate(ct)) {
					datetimepicker.data('changed', true);
				} else {
					ct = '';
				}

				return ct || 0;
			}

			function setMask(options) {

				var isValidValue = function (mask, value) {
					var reg = mask
						.replace(/([\[\]\/\{\}\(\)\-\.\+]{1})/g, '\\$1')
						.replace(/_/g, '{digit+}')
						.replace(/([0-9]{1})/g, '{digit$1}')
						.replace(/\{digit([0-9]{1})\}/g, '[0-$1_]{1}')
						.replace(/\{digit[\+]\}/g, '[0-9_]{1}');
					return (new RegExp(reg)).test(value);
				},
				getCaretPos = function (input) {
					try {
						if (document.selection && document.selection.createRange) {
							var range = document.selection.createRange();
							return range.getBookmark().charCodeAt(2) - 2;
						}
						if (input.setSelectionRange) {
							return input.selectionStart;
						}
					} catch (e) {
						return 0;
					}
				},
				setCaretPos = function (node, pos) {
					node = (typeof node === "string" || node instanceof String) ? document.getElementById(node) : node;
					if (!node) {
						return false;
					}
					if (node.createTextRange) {
						var textRange = node.createTextRange();
						textRange.collapse(true);
						textRange.moveEnd('character', pos);
						textRange.moveStart('character', pos);
						textRange.select();
						return true;
					}
					if (node.setSelectionRange) {
						node.setSelectionRange(pos, pos);
						return true;
					}
					return false;
				};
				if(options.mask) {
					input.off('keydown.xdsoft');
				}
				if (options.mask === true) {
														if (typeof moment != 'undefined') {
																	options.mask = options.format
																			.replace(/Y{4}/g, '9999')
																			.replace(/Y{2}/g, '99')
																			.replace(/M{2}/g, '19')
																			.replace(/D{2}/g, '39')
																			.replace(/H{2}/g, '29')
																			.replace(/m{2}/g, '59')
																			.replace(/s{2}/g, '59');
														} else {
																	options.mask = options.format
																			.replace(/Y/g, '9999')
																			.replace(/F/g, '9999')
																			.replace(/m/g, '19')
																			.replace(/d/g, '39')
																			.replace(/H/g, '29')
																			.replace(/i/g, '59')
																			.replace(/s/g, '59');
														}
				}

				if ($.type(options.mask) === 'string') {
					if (!isValidValue(options.mask, input.val())) {
						input.val(options.mask.replace(/[0-9]/g, '_'));
						setCaretPos(input[0], 0);
					}

					input.on('keydown.xdsoft', function (event) {
						var val = this.value,
							key = event.which,
							pos,
							digit;

						if (((key >= KEY0 && key <= KEY9) || (key >= _KEY0 && key <= _KEY9)) || (key === BACKSPACE || key === DEL)) {
							pos = getCaretPos(this);
							digit = (key !== BACKSPACE && key !== DEL) ? String.fromCharCode((_KEY0 <= key && key <= _KEY9) ? key - KEY0 : key) : '_';

							if ((key === BACKSPACE || key === DEL) && pos) {
								pos -= 1;
								digit = '_';
							}

							while (/[^0-9_]/.test(options.mask.substr(pos, 1)) && pos < options.mask.length && pos > 0) {
								pos += (key === BACKSPACE || key === DEL) ? -1 : 1;
							}

							val = val.substr(0, pos) + digit + val.substr(pos + 1);
							if ($.trim(val) === '') {
								val = options.mask.replace(/[0-9]/g, '_');
							} else {
								if (pos === options.mask.length) {
									event.preventDefault();
									return false;
								}
							}

							pos += (key === BACKSPACE || key === DEL) ? 0 : 1;
							while (/[^0-9_]/.test(options.mask.substr(pos, 1)) && pos < options.mask.length && pos > 0) {
								pos += (key === BACKSPACE || key === DEL) ? -1 : 1;
							}

							if (isValidValue(options.mask, val)) {
								this.value = val;
								setCaretPos(this, pos);
							} else if ($.trim(val) === '') {
								this.value = options.mask.replace(/[0-9]/g, '_');
							} else {
								input.trigger('error_input.xdsoft');
							}
						} else {
							if (([AKEY, CKEY, VKEY, ZKEY, YKEY].indexOf(key) !== -1 && ctrlDown) || [ESC, ARROWUP, ARROWDOWN, ARROWLEFT, ARROWRIGHT, F5, CTRLKEY, TAB, ENTER].indexOf(key) !== -1) {
								return true;
							}
						}

						event.preventDefault();
						return false;
					});
				}
			}

			_xdsoft_datetime.setCurrentTime(getCurrentValue());

			input
				.data('xdsoft_datetimepicker', datetimepicker)
				.on('open.xdsoft focusin.xdsoft mousedown.xdsoft touchstart', function () {
					if (input.is(':disabled') || (input.data('xdsoft_datetimepicker').is(':visible') && options.closeOnInputClick)) {
						return;
					}
					clearTimeout(timer);
					timer = setTimeout(function () {
						if (input.is(':disabled')) {
							return;
						}

						triggerAfterOpen = true;
						_xdsoft_datetime.setCurrentTime(getCurrentValue(), true);
						if(options.mask) {
							setMask(options);
						}
						datetimepicker.trigger('open.xdsoft');
					}, 100);
				})
				.on('keydown.xdsoft', function (event) {
					var elementSelector,
						key = event.which;
					if ([ENTER].indexOf(key) !== -1 && options.enterLikeTab) {
						elementSelector = $("input:visible,textarea:visible,button:visible,a:visible");
						datetimepicker.trigger('close.xdsoft');
						elementSelector.eq(elementSelector.index(this) + 1).focus();
						return false;
					}
					if ([TAB].indexOf(key) !== -1) {
						datetimepicker.trigger('close.xdsoft');
						return true;
					}
				})
				.on('blur.xdsoft', function () {
					datetimepicker.trigger('close.xdsoft');
				});
		};
		destroyDateTimePicker = function (input) {
			var datetimepicker = input.data('xdsoft_datetimepicker');
			if (datetimepicker) {
				datetimepicker.data('xdsoft_datetime', null);
				datetimepicker.remove();
				input
					.data('xdsoft_datetimepicker', null)
					.off('.xdsoft');
				$(window).off('resize.xdsoft');
				$([window, document.body]).off('mousedown.xdsoft touchstart');
				if (input.unmousewheel) {
					input.unmousewheel();
				}
			}
		};
		$(document)
			.off('keydown.xdsoftctrl keyup.xdsoftctrl')
			.on('keydown.xdsoftctrl', function (e) {
				if (e.keyCode === CTRLKEY) {
					ctrlDown = true;
				}
			})
			.on('keyup.xdsoftctrl', function (e) {
				if (e.keyCode === CTRLKEY) {
					ctrlDown = false;
				}
			});

		this.each(function () {
			var datetimepicker = $(this).data('xdsoft_datetimepicker'), $input;
			if (datetimepicker) {
				if ($.type(opt) === 'string') {
					switch (opt) {
					case 'show':
						$(this).select().focus();
						datetimepicker.trigger('open.xdsoft');
						break;
					case 'hide':
						datetimepicker.trigger('close.xdsoft');
						break;
					case 'toggle':
						datetimepicker.trigger('toggle.xdsoft');
						break;
					case 'destroy':
						destroyDateTimePicker($(this));
						break;
					case 'reset':
						this.value = this.defaultValue;
						if (!this.value || !datetimepicker.data('xdsoft_datetime').isValidDate(dateHelper.parseDate(this.value, options.format))) {
							datetimepicker.data('changed', false);
						}
						datetimepicker.data('xdsoft_datetime').setCurrentTime(this.value);
						break;
					case 'validate':
						$input = datetimepicker.data('input');
						$input.trigger('blur.xdsoft');
						break;
					default:
						if (datetimepicker[opt] && $.isFunction(datetimepicker[opt])) {
							result = datetimepicker[opt](opt2);
						}
					}
				} else {
					datetimepicker
						.setOptions(opt);
				}
				return 0;
			}
			if ($.type(opt) !== 'string') {
				if (!options.lazyInit || options.open || options.inline) {
					createDateTimePicker($(this));
				} else {
					lazyInit($(this));
				}
			}
		});

		return result;
	};

	$.fn.datetimepicker.defaults = default_options;

	function HighlightedDate(date, desc, style) {
		"use strict";
		this.date = date;
		this.desc = desc;
		this.style = style;
	}
}));
/*!
 * jQuery Mousewheel 3.1.13
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 */

(function (factory) {
    if ( typeof define === 'function' && define.amd ) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS style for Browserify
        module.exports = factory;
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {

    var toFix  = ['wheel', 'mousewheel', 'DOMMouseScroll', 'MozMousePixelScroll'],
        toBind = ( 'onwheel' in document || document.documentMode >= 9 ) ?
                    ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'],
        slice  = Array.prototype.slice,
        nullLowestDeltaTimeout, lowestDelta;

    if ( $.event.fixHooks ) {
        for ( var i = toFix.length; i; ) {
            $.event.fixHooks[ toFix[--i] ] = $.event.mouseHooks;
        }
    }

    var special = $.event.special.mousewheel = {
        version: '3.1.12',

        setup: function() {
            if ( this.addEventListener ) {
                for ( var i = toBind.length; i; ) {
                    this.addEventListener( toBind[--i], handler, false );
                }
            } else {
                this.onmousewheel = handler;
            }
            // Store the line height and page height for this particular element
            $.data(this, 'mousewheel-line-height', special.getLineHeight(this));
            $.data(this, 'mousewheel-page-height', special.getPageHeight(this));
        },

        teardown: function() {
            if ( this.removeEventListener ) {
                for ( var i = toBind.length; i; ) {
                    this.removeEventListener( toBind[--i], handler, false );
                }
            } else {
                this.onmousewheel = null;
            }
            // Clean up the data we added to the element
            $.removeData(this, 'mousewheel-line-height');
            $.removeData(this, 'mousewheel-page-height');
        },

        getLineHeight: function(elem) {
            var $elem = $(elem),
                $parent = $elem['offsetParent' in $.fn ? 'offsetParent' : 'parent']();
            if (!$parent.length) {
                $parent = $('body');
            }
            return parseInt($parent.css('fontSize'), 10) || parseInt($elem.css('fontSize'), 10) || 16;
        },

        getPageHeight: function(elem) {
            return $(elem).height();
        },

        settings: {
            adjustOldDeltas: true, // see shouldAdjustOldDeltas() below
            normalizeOffset: true  // calls getBoundingClientRect for each event
        }
    };

    $.fn.extend({
        mousewheel: function(fn) {
            return fn ? this.bind('mousewheel', fn) : this.trigger('mousewheel');
        },

        unmousewheel: function(fn) {
            return this.unbind('mousewheel', fn);
        }
    });


    function handler(event) {
        var orgEvent   = event || window.event,
            args       = slice.call(arguments, 1),
            delta      = 0,
            deltaX     = 0,
            deltaY     = 0,
            absDelta   = 0,
            offsetX    = 0,
            offsetY    = 0;
        event = $.event.fix(orgEvent);
        event.type = 'mousewheel';

        // Old school scrollwheel delta
        if ( 'detail'      in orgEvent ) { deltaY = orgEvent.detail * -1;      }
        if ( 'wheelDelta'  in orgEvent ) { deltaY = orgEvent.wheelDelta;       }
        if ( 'wheelDeltaY' in orgEvent ) { deltaY = orgEvent.wheelDeltaY;      }
        if ( 'wheelDeltaX' in orgEvent ) { deltaX = orgEvent.wheelDeltaX * -1; }

        // Firefox < 17 horizontal scrolling related to DOMMouseScroll event
        if ( 'axis' in orgEvent && orgEvent.axis === orgEvent.HORIZONTAL_AXIS ) {
            deltaX = deltaY * -1;
            deltaY = 0;
        }

        // Set delta to be deltaY or deltaX if deltaY is 0 for backwards compatabilitiy
        delta = deltaY === 0 ? deltaX : deltaY;

        // New school wheel delta (wheel event)
        if ( 'deltaY' in orgEvent ) {
            deltaY = orgEvent.deltaY * -1;
            delta  = deltaY;
        }
        if ( 'deltaX' in orgEvent ) {
            deltaX = orgEvent.deltaX;
            if ( deltaY === 0 ) { delta  = deltaX * -1; }
        }

        // No change actually happened, no reason to go any further
        if ( deltaY === 0 && deltaX === 0 ) { return; }

        // Need to convert lines and pages to pixels if we aren't already in pixels
        // There are three delta modes:
        //   * deltaMode 0 is by pixels, nothing to do
        //   * deltaMode 1 is by lines
        //   * deltaMode 2 is by pages
        if ( orgEvent.deltaMode === 1 ) {
            var lineHeight = $.data(this, 'mousewheel-line-height');
            delta  *= lineHeight;
            deltaY *= lineHeight;
            deltaX *= lineHeight;
        } else if ( orgEvent.deltaMode === 2 ) {
            var pageHeight = $.data(this, 'mousewheel-page-height');
            delta  *= pageHeight;
            deltaY *= pageHeight;
            deltaX *= pageHeight;
        }

        // Store lowest absolute delta to normalize the delta values
        absDelta = Math.max( Math.abs(deltaY), Math.abs(deltaX) );

        if ( !lowestDelta || absDelta < lowestDelta ) {
            lowestDelta = absDelta;

            // Adjust older deltas if necessary
            if ( shouldAdjustOldDeltas(orgEvent, absDelta) ) {
                lowestDelta /= 40;
            }
        }

        // Adjust older deltas if necessary
        if ( shouldAdjustOldDeltas(orgEvent, absDelta) ) {
            // Divide all the things by 40!
            delta  /= 40;
            deltaX /= 40;
            deltaY /= 40;
        }

        // Get a whole, normalized value for the deltas
        delta  = Math[ delta  >= 1 ? 'floor' : 'ceil' ](delta  / lowestDelta);
        deltaX = Math[ deltaX >= 1 ? 'floor' : 'ceil' ](deltaX / lowestDelta);
        deltaY = Math[ deltaY >= 1 ? 'floor' : 'ceil' ](deltaY / lowestDelta);

        // Normalise offsetX and offsetY properties
        if ( special.settings.normalizeOffset && this.getBoundingClientRect ) {
            var boundingRect = this.getBoundingClientRect();
            offsetX = event.clientX - boundingRect.left;
            offsetY = event.clientY - boundingRect.top;
        }

        // Add information to the event object
        event.deltaX = deltaX;
        event.deltaY = deltaY;
        event.deltaFactor = lowestDelta;
        event.offsetX = offsetX;
        event.offsetY = offsetY;
        // Go ahead and set deltaMode to 0 since we converted to pixels
        // Although this is a little odd since we overwrite the deltaX/Y
        // properties with normalized deltas.
        event.deltaMode = 0;

        // Add event and delta to the front of the arguments
        args.unshift(event, delta, deltaX, deltaY);

        // Clearout lowestDelta after sometime to better
        // handle multiple device types that give different
        // a different lowestDelta
        // Ex: trackpad = 3 and mouse wheel = 120
        if (nullLowestDeltaTimeout) { clearTimeout(nullLowestDeltaTimeout); }
        nullLowestDeltaTimeout = setTimeout(nullLowestDelta, 200);

        return ($.event.dispatch || $.event.handle).apply(this, args);
    }

    function nullLowestDelta() {
        lowestDelta = null;
    }

    function shouldAdjustOldDeltas(orgEvent, absDelta) {
        // If this is an older event and the delta is divisable by 120,
        // then we are assuming that the browser is treating this as an
        // older mouse wheel event and that we should divide the deltas
        // by 40 to try and get a more usable deltaFactor.
        // Side note, this actually impacts the reported scroll distance
        // in older browsers and can cause scrolling to be slower than native.
        // Turn this off by setting $.event.special.mousewheel.settings.adjustOldDeltas to false.
        return special.settings.adjustOldDeltas && orgEvent.type === 'mousewheel' && absDelta % 120 === 0;
    }

}));

/*
 * JQuery zTree core v3.5.19.3
 * http://zTree.me/
 *
 * Copyright (c) 2010 Hunter.z
 *
 * Licensed same as jquery - MIT License
 * http://www.opensource.org/licenses/mit-license.php
 *
 * email: hunter.z@263.net
 * Date: 2015-12-04
 */
(function(q){var H,I,J,K,L,M,u,r={},v={},w={},N={treeId:"",treeObj:null,view:{addDiyDom:null,autoCancelSelected:!0,dblClickExpand:!0,expandSpeed:"fast",fontCss:{},nameIsHTML:!1,selectedMulti:!0,showIcon:!0,showLine:!0,showTitle:!0,txtSelectedEnable:!1},data:{key:{children:"children",name:"name",title:"",url:"url",icon:"icon"},simpleData:{enable:!1,idKey:"id",pIdKey:"pId",rootPId:null},keep:{parent:!1,leaf:!1}},async:{enable:!1,contentType:"application/x-www-form-urlencoded",type:"post",dataType:"text",
url:"",autoParam:[],otherParam:[],dataFilter:null},callback:{beforeAsync:null,beforeClick:null,beforeDblClick:null,beforeRightClick:null,beforeMouseDown:null,beforeMouseUp:null,beforeExpand:null,beforeCollapse:null,beforeRemove:null,onAsyncError:null,onAsyncSuccess:null,onNodeCreated:null,onClick:null,onDblClick:null,onRightClick:null,onMouseDown:null,onMouseUp:null,onExpand:null,onCollapse:null,onRemove:null}},x=[function(b){var a=b.treeObj,c=f.event;a.bind(c.NODECREATED,function(a,c,g){j.apply(b.callback.onNodeCreated,
[a,c,g])});a.bind(c.CLICK,function(a,c,g,n,h){j.apply(b.callback.onClick,[c,g,n,h])});a.bind(c.EXPAND,function(a,c,g){j.apply(b.callback.onExpand,[a,c,g])});a.bind(c.COLLAPSE,function(a,c,g){j.apply(b.callback.onCollapse,[a,c,g])});a.bind(c.ASYNC_SUCCESS,function(a,c,g,n){j.apply(b.callback.onAsyncSuccess,[a,c,g,n])});a.bind(c.ASYNC_ERROR,function(a,c,g,n,h,f){j.apply(b.callback.onAsyncError,[a,c,g,n,h,f])});a.bind(c.REMOVE,function(a,c,g){j.apply(b.callback.onRemove,[a,c,g])});a.bind(c.SELECTED,
function(a,c,g){j.apply(b.callback.onSelected,[c,g])});a.bind(c.UNSELECTED,function(a,c,g){j.apply(b.callback.onUnSelected,[c,g])})}],y=[function(b){var a=f.event;b.treeObj.unbind(a.NODECREATED).unbind(a.CLICK).unbind(a.EXPAND).unbind(a.COLLAPSE).unbind(a.ASYNC_SUCCESS).unbind(a.ASYNC_ERROR).unbind(a.REMOVE).unbind(a.SELECTED).unbind(a.UNSELECTED)}],z=[function(b){var a=h.getCache(b);a||(a={},h.setCache(b,a));a.nodes=[];a.doms=[]}],A=[function(b,a,c,d,e,g){if(c){var n=h.getRoot(b),f=b.data.key.children;
c.level=a;c.tId=b.treeId+"_"+ ++n.zId;c.parentTId=d?d.tId:null;c.open=typeof c.open=="string"?j.eqs(c.open,"true"):!!c.open;c[f]&&c[f].length>0?(c.isParent=!0,c.zAsync=!0):(c.isParent=typeof c.isParent=="string"?j.eqs(c.isParent,"true"):!!c.isParent,c.open=c.isParent&&!b.async.enable?c.open:!1,c.zAsync=!c.isParent);c.isFirstNode=e;c.isLastNode=g;c.getParentNode=function(){return h.getNodeCache(b,c.parentTId)};c.getPreNode=function(){return h.getPreNode(b,c)};c.getNextNode=function(){return h.getNextNode(b,
c)};c.getIndex=function(){return h.getNodeIndex(b,c)};c.getPath=function(){return h.getNodePath(b,c)};c.isAjaxing=!1;h.fixPIdKeyValue(b,c)}}],t=[function(b){var a=b.target,c=h.getSetting(b.data.treeId),d="",e=null,g="",n="",i=null,m=null,k=null;if(j.eqs(b.type,"mousedown"))n="mousedown";else if(j.eqs(b.type,"mouseup"))n="mouseup";else if(j.eqs(b.type,"contextmenu"))n="contextmenu";else if(j.eqs(b.type,"click"))if(j.eqs(a.tagName,"span")&&a.getAttribute("treeNode"+f.id.SWITCH)!==null)d=j.getNodeMainDom(a).id,
g="switchNode";else{if(k=j.getMDom(c,a,[{tagName:"a",attrName:"treeNode"+f.id.A}]))d=j.getNodeMainDom(k).id,g="clickNode"}else if(j.eqs(b.type,"dblclick")&&(n="dblclick",k=j.getMDom(c,a,[{tagName:"a",attrName:"treeNode"+f.id.A}])))d=j.getNodeMainDom(k).id,g="switchNode";if(n.length>0&&d.length==0&&(k=j.getMDom(c,a,[{tagName:"a",attrName:"treeNode"+f.id.A}])))d=j.getNodeMainDom(k).id;if(d.length>0)switch(e=h.getNodeCache(c,d),g){case "switchNode":e.isParent?j.eqs(b.type,"click")||j.eqs(b.type,"dblclick")&&
j.apply(c.view.dblClickExpand,[c.treeId,e],c.view.dblClickExpand)?i=H:g="":g="";break;case "clickNode":i=I}switch(n){case "mousedown":m=J;break;case "mouseup":m=K;break;case "dblclick":m=L;break;case "contextmenu":m=M}return{stop:!1,node:e,nodeEventType:g,nodeEventCallback:i,treeEventType:n,treeEventCallback:m}}],B=[function(b){var a=h.getRoot(b);a||(a={},h.setRoot(b,a));a[b.data.key.children]=[];a.expandTriggerFlag=!1;a.curSelectedList=[];a.noSelection=!0;a.createdNodes=[];a.zId=0;a._ver=(new Date).getTime()}],
C=[],D=[],E=[],F=[],G=[],h={addNodeCache:function(b,a){h.getCache(b).nodes[h.getNodeCacheId(a.tId)]=a},getNodeCacheId:function(b){return b.substring(b.lastIndexOf("_")+1)},addAfterA:function(b){D.push(b)},addBeforeA:function(b){C.push(b)},addInnerAfterA:function(b){F.push(b)},addInnerBeforeA:function(b){E.push(b)},addInitBind:function(b){x.push(b)},addInitUnBind:function(b){y.push(b)},addInitCache:function(b){z.push(b)},addInitNode:function(b){A.push(b)},addInitProxy:function(b,a){a?t.splice(0,0,
b):t.push(b)},addInitRoot:function(b){B.push(b)},addNodesData:function(b,a,c,d){var e=b.data.key.children;a[e]?c>=a[e].length&&(c=-1):(a[e]=[],c=-1);if(a[e].length>0&&c===0)a[e][0].isFirstNode=!1,i.setNodeLineIcos(b,a[e][0]);else if(a[e].length>0&&c<0)a[e][a[e].length-1].isLastNode=!1,i.setNodeLineIcos(b,a[e][a[e].length-1]);a.isParent=!0;c<0?a[e]=a[e].concat(d):(b=[c,0].concat(d),a[e].splice.apply(a[e],b))},addSelectedNode:function(b,a){var c=h.getRoot(b);h.isSelectedNode(b,a)||c.curSelectedList.push(a)},
addCreatedNode:function(b,a){(b.callback.onNodeCreated||b.view.addDiyDom)&&h.getRoot(b).createdNodes.push(a)},addZTreeTools:function(b){G.push(b)},exSetting:function(b){q.extend(!0,N,b)},fixPIdKeyValue:function(b,a){b.data.simpleData.enable&&(a[b.data.simpleData.pIdKey]=a.parentTId?a.getParentNode()[b.data.simpleData.idKey]:b.data.simpleData.rootPId)},getAfterA:function(b,a,c){for(var d=0,e=D.length;d<e;d++)D[d].apply(this,arguments)},getBeforeA:function(b,a,c){for(var d=0,e=C.length;d<e;d++)C[d].apply(this,
arguments)},getInnerAfterA:function(b,a,c){for(var d=0,e=F.length;d<e;d++)F[d].apply(this,arguments)},getInnerBeforeA:function(b,a,c){for(var d=0,e=E.length;d<e;d++)E[d].apply(this,arguments)},getCache:function(b){return w[b.treeId]},getNodeIndex:function(b,a){if(!a)return null;for(var c=b.data.key.children,d=a.parentTId?a.getParentNode():h.getRoot(b),e=0,g=d[c].length-1;e<=g;e++)if(d[c][e]===a)return e;return-1},getNextNode:function(b,a){if(!a)return null;for(var c=b.data.key.children,d=a.parentTId?
a.getParentNode():h.getRoot(b),e=0,g=d[c].length-1;e<=g;e++)if(d[c][e]===a)return e==g?null:d[c][e+1];return null},getNodeByParam:function(b,a,c,d){if(!a||!c)return null;for(var e=b.data.key.children,g=0,n=a.length;g<n;g++){if(a[g][c]==d)return a[g];var f=h.getNodeByParam(b,a[g][e],c,d);if(f)return f}return null},getNodeCache:function(b,a){if(!a)return null;var c=w[b.treeId].nodes[h.getNodeCacheId(a)];return c?c:null},getNodeName:function(b,a){return""+a[b.data.key.name]},getNodePath:function(b,a){if(!a)return null;
var c;(c=a.parentTId?a.getParentNode().getPath():[])&&c.push(a);return c},getNodeTitle:function(b,a){return""+a[b.data.key.title===""?b.data.key.name:b.data.key.title]},getNodes:function(b){return h.getRoot(b)[b.data.key.children]},getNodesByParam:function(b,a,c,d){if(!a||!c)return[];for(var e=b.data.key.children,g=[],f=0,i=a.length;f<i;f++)a[f][c]==d&&g.push(a[f]),g=g.concat(h.getNodesByParam(b,a[f][e],c,d));return g},getNodesByParamFuzzy:function(b,a,c,d){if(!a||!c)return[];for(var e=b.data.key.children,
g=[],d=d.toLowerCase(),f=0,i=a.length;f<i;f++)typeof a[f][c]=="string"&&a[f][c].toLowerCase().indexOf(d)>-1&&g.push(a[f]),g=g.concat(h.getNodesByParamFuzzy(b,a[f][e],c,d));return g},getNodesByFilter:function(b,a,c,d,e){if(!a)return d?null:[];for(var g=b.data.key.children,f=d?null:[],i=0,m=a.length;i<m;i++){if(j.apply(c,[a[i],e],!1)){if(d)return a[i];f.push(a[i])}var k=h.getNodesByFilter(b,a[i][g],c,d,e);if(d&&k)return k;f=d?k:f.concat(k)}return f},getPreNode:function(b,a){if(!a)return null;for(var c=
b.data.key.children,d=a.parentTId?a.getParentNode():h.getRoot(b),e=0,g=d[c].length;e<g;e++)if(d[c][e]===a)return e==0?null:d[c][e-1];return null},getRoot:function(b){return b?v[b.treeId]:null},getRoots:function(){return v},getSetting:function(b){return r[b]},getSettings:function(){return r},getZTreeTools:function(b){return(b=this.getRoot(this.getSetting(b)))?b.treeTools:null},initCache:function(b){for(var a=0,c=z.length;a<c;a++)z[a].apply(this,arguments)},initNode:function(b,a,c,d,e,g){for(var f=
0,h=A.length;f<h;f++)A[f].apply(this,arguments)},initRoot:function(b){for(var a=0,c=B.length;a<c;a++)B[a].apply(this,arguments)},isSelectedNode:function(b,a){for(var c=h.getRoot(b),d=0,e=c.curSelectedList.length;d<e;d++)if(a===c.curSelectedList[d])return!0;return!1},removeNodeCache:function(b,a){var c=b.data.key.children;if(a[c])for(var d=0,e=a[c].length;d<e;d++)arguments.callee(b,a[c][d]);h.getCache(b).nodes[h.getNodeCacheId(a.tId)]=null},removeSelectedNode:function(b,a){for(var c=h.getRoot(b),d=
0,e=c.curSelectedList.length;d<e;d++)if(a===c.curSelectedList[d]||!h.getNodeCache(b,c.curSelectedList[d].tId))c.curSelectedList.splice(d,1),b.treeObj.trigger(f.event.UNSELECTED,[b.treeId,a]),d--,e--},setCache:function(b,a){w[b.treeId]=a},setRoot:function(b,a){v[b.treeId]=a},setZTreeTools:function(b,a){for(var c=0,d=G.length;c<d;c++)G[c].apply(this,arguments)},transformToArrayFormat:function(b,a){if(!a)return[];var c=b.data.key.children,d=[];if(j.isArray(a))for(var e=0,g=a.length;e<g;e++)d.push(a[e]),
a[e][c]&&(d=d.concat(h.transformToArrayFormat(b,a[e][c])));else d.push(a),a[c]&&(d=d.concat(h.transformToArrayFormat(b,a[c])));return d},transformTozTreeFormat:function(b,a){var c,d,e=b.data.simpleData.idKey,g=b.data.simpleData.pIdKey,f=b.data.key.children;if(!e||e==""||!a)return[];if(j.isArray(a)){var h=[],i=[];for(c=0,d=a.length;c<d;c++)i[a[c][e]]=a[c];for(c=0,d=a.length;c<d;c++)i[a[c][g]]&&a[c][e]!=a[c][g]?(i[a[c][g]][f]||(i[a[c][g]][f]=[]),i[a[c][g]][f].push(a[c])):h.push(a[c]);return h}else return[a]}},
l={bindEvent:function(b){for(var a=0,c=x.length;a<c;a++)x[a].apply(this,arguments)},unbindEvent:function(b){for(var a=0,c=y.length;a<c;a++)y[a].apply(this,arguments)},bindTree:function(b){var a={treeId:b.treeId},c=b.treeObj;b.view.txtSelectedEnable||c.bind("selectstart",u).css({"-moz-user-select":"-moz-none"});c.bind("click",a,l.proxy);c.bind("dblclick",a,l.proxy);c.bind("mouseover",a,l.proxy);c.bind("mouseout",a,l.proxy);c.bind("mousedown",a,l.proxy);c.bind("mouseup",a,l.proxy);c.bind("contextmenu",
a,l.proxy)},unbindTree:function(b){b.treeObj.unbind("selectstart",u).unbind("click",l.proxy).unbind("dblclick",l.proxy).unbind("mouseover",l.proxy).unbind("mouseout",l.proxy).unbind("mousedown",l.proxy).unbind("mouseup",l.proxy).unbind("contextmenu",l.proxy)},doProxy:function(b){for(var a=[],c=0,d=t.length;c<d;c++){var e=t[c].apply(this,arguments);a.push(e);if(e.stop)break}return a},proxy:function(b){var a=h.getSetting(b.data.treeId);if(!j.uCanDo(a,b))return!0;for(var a=l.doProxy(b),c=!0,d=0,e=a.length;d<
e;d++){var g=a[d];g.nodeEventCallback&&(c=g.nodeEventCallback.apply(g,[b,g.node])&&c);g.treeEventCallback&&(c=g.treeEventCallback.apply(g,[b,g.node])&&c)}return c}};H=function(b,a){var c=h.getSetting(b.data.treeId);if(a.open){if(j.apply(c.callback.beforeCollapse,[c.treeId,a],!0)==!1)return!0}else if(j.apply(c.callback.beforeExpand,[c.treeId,a],!0)==!1)return!0;h.getRoot(c).expandTriggerFlag=!0;i.switchNode(c,a);return!0};I=function(b,a){var c=h.getSetting(b.data.treeId),d=c.view.autoCancelSelected&&
(b.ctrlKey||b.metaKey)&&h.isSelectedNode(c,a)?0:c.view.autoCancelSelected&&(b.ctrlKey||b.metaKey)&&c.view.selectedMulti?2:1;if(j.apply(c.callback.beforeClick,[c.treeId,a,d],!0)==!1)return!0;d===0?i.cancelPreSelectedNode(c,a):i.selectNode(c,a,d===2);c.treeObj.trigger(f.event.CLICK,[b,c.treeId,a,d]);return!0};J=function(b,a){var c=h.getSetting(b.data.treeId);j.apply(c.callback.beforeMouseDown,[c.treeId,a],!0)&&j.apply(c.callback.onMouseDown,[b,c.treeId,a]);return!0};K=function(b,a){var c=h.getSetting(b.data.treeId);
j.apply(c.callback.beforeMouseUp,[c.treeId,a],!0)&&j.apply(c.callback.onMouseUp,[b,c.treeId,a]);return!0};L=function(b,a){var c=h.getSetting(b.data.treeId);j.apply(c.callback.beforeDblClick,[c.treeId,a],!0)&&j.apply(c.callback.onDblClick,[b,c.treeId,a]);return!0};M=function(b,a){var c=h.getSetting(b.data.treeId);j.apply(c.callback.beforeRightClick,[c.treeId,a],!0)&&j.apply(c.callback.onRightClick,[b,c.treeId,a]);return typeof c.callback.onRightClick!="function"};u=function(b){b=b.originalEvent.srcElement.nodeName.toLowerCase();
return b==="input"||b==="textarea"};var j={apply:function(b,a,c){return typeof b=="function"?b.apply(O,a?a:[]):c},canAsync:function(b,a){var c=b.data.key.children;return b.async.enable&&a&&a.isParent&&!(a.zAsync||a[c]&&a[c].length>0)},clone:function(b){if(b===null)return null;var a=j.isArray(b)?[]:{},c;for(c in b)a[c]=b[c]instanceof Date?new Date(b[c].getTime()):typeof b[c]==="object"?arguments.callee(b[c]):b[c];return a},eqs:function(b,a){return b.toLowerCase()===a.toLowerCase()},isArray:function(b){return Object.prototype.toString.apply(b)===
"[object Array]"},$:function(b,a,c){a&&typeof a!="string"&&(c=a,a="");return typeof b=="string"?q(b,c?c.treeObj.get(0).ownerDocument:null):q("#"+b.tId+a,c?c.treeObj:null)},getMDom:function(b,a,c){if(!a)return null;for(;a&&a.id!==b.treeId;){for(var d=0,e=c.length;a.tagName&&d<e;d++)if(j.eqs(a.tagName,c[d].tagName)&&a.getAttribute(c[d].attrName)!==null)return a;a=a.parentNode}return null},getNodeMainDom:function(b){return q(b).parent("li").get(0)||q(b).parentsUntil("li").parent().get(0)},isChildOrSelf:function(b,
a){return q(b).closest("#"+a).length>0},uCanDo:function(){return!0}},i={addNodes:function(b,a,c,d,e){if(!b.data.keep.leaf||!a||a.isParent)if(j.isArray(d)||(d=[d]),b.data.simpleData.enable&&(d=h.transformTozTreeFormat(b,d)),a){var g=k(a,f.id.SWITCH,b),n=k(a,f.id.ICON,b),o=k(a,f.id.UL,b);if(!a.open)i.replaceSwitchClass(a,g,f.folder.CLOSE),i.replaceIcoClass(a,n,f.folder.CLOSE),a.open=!1,o.css({display:"none"});h.addNodesData(b,a,c,d);i.createNodes(b,a.level+1,d,a,c);e||i.expandCollapseParentNode(b,a,
!0)}else h.addNodesData(b,h.getRoot(b),c,d),i.createNodes(b,0,d,null,c)},appendNodes:function(b,a,c,d,e,g,f){if(!c)return[];var j=[],m=b.data.key.children,k=(d?d:h.getRoot(b))[m],l,Q;if(!k||e>=k.length)e=-1;for(var s=0,q=c.length;s<q;s++){var p=c[s];g&&(l=(e===0||k.length==c.length)&&s==0,Q=e<0&&s==c.length-1,h.initNode(b,a,p,d,l,Q,f),h.addNodeCache(b,p));l=[];p[m]&&p[m].length>0&&(l=i.appendNodes(b,a+1,p[m],p,-1,g,f&&p.open));f&&(i.makeDOMNodeMainBefore(j,b,p),i.makeDOMNodeLine(j,b,p),h.getBeforeA(b,
p,j),i.makeDOMNodeNameBefore(j,b,p),h.getInnerBeforeA(b,p,j),i.makeDOMNodeIcon(j,b,p),h.getInnerAfterA(b,p,j),i.makeDOMNodeNameAfter(j,b,p),h.getAfterA(b,p,j),p.isParent&&p.open&&i.makeUlHtml(b,p,j,l.join("")),i.makeDOMNodeMainAfter(j,b,p),h.addCreatedNode(b,p))}return j},appendParentULDom:function(b,a){var c=[],d=k(a,b);!d.get(0)&&a.parentTId&&(i.appendParentULDom(b,a.getParentNode()),d=k(a,b));var e=k(a,f.id.UL,b);e.get(0)&&e.remove();e=i.appendNodes(b,a.level+1,a[b.data.key.children],a,-1,!1,!0);
i.makeUlHtml(b,a,c,e.join(""));d.append(c.join(""))},asyncNode:function(b,a,c,d){var e,g;if(a&&!a.isParent)return j.apply(d),!1;else if(a&&a.isAjaxing)return!1;else if(j.apply(b.callback.beforeAsync,[b.treeId,a],!0)==!1)return j.apply(d),!1;if(a)a.isAjaxing=!0,k(a,f.id.ICON,b).attr({style:"","class":f.className.BUTTON+" "+f.className.ICO_LOADING});var n={};for(e=0,g=b.async.autoParam.length;a&&e<g;e++){var o=b.async.autoParam[e].split("="),m=o;o.length>1&&(m=o[1],o=o[0]);n[m]=a[o]}if(j.isArray(b.async.otherParam))for(e=
0,g=b.async.otherParam.length;e<g;e+=2)n[b.async.otherParam[e]]=b.async.otherParam[e+1];else for(var l in b.async.otherParam)n[l]=b.async.otherParam[l];var P=h.getRoot(b)._ver;q.ajax({contentType:b.async.contentType,cache:!1,type:b.async.type,url:j.apply(b.async.url,[b.treeId,a],b.async.url),data:n,dataType:b.async.dataType,success:function(e){if(P==h.getRoot(b)._ver){var g=[];try{g=!e||e.length==0?[]:typeof e=="string"?eval("("+e+")"):e}catch(n){g=e}if(a)a.isAjaxing=null,a.zAsync=!0;i.setNodeLineIcos(b,
a);g&&g!==""?(g=j.apply(b.async.dataFilter,[b.treeId,a,g],g),i.addNodes(b,a,-1,g?j.clone(g):[],!!c)):i.addNodes(b,a,-1,[],!!c);b.treeObj.trigger(f.event.ASYNC_SUCCESS,[b.treeId,a,e]);j.apply(d)}},error:function(c,d,e){if(P==h.getRoot(b)._ver){if(a)a.isAjaxing=null;i.setNodeLineIcos(b,a);b.treeObj.trigger(f.event.ASYNC_ERROR,[b.treeId,a,c,d,e])}}});return!0},cancelPreSelectedNode:function(b,a,c){var d=h.getRoot(b).curSelectedList,e,g;for(e=d.length-1;e>=0;e--)if(g=d[e],a===g||!a&&(!c||c!==g))if(k(g,
f.id.A,b).removeClass(f.node.CURSELECTED),a){h.removeSelectedNode(b,a);break}else d.splice(e,1),b.treeObj.trigger(f.event.UNSELECTED,[b.treeId,g])},createNodeCallback:function(b){if(b.callback.onNodeCreated||b.view.addDiyDom)for(var a=h.getRoot(b);a.createdNodes.length>0;){var c=a.createdNodes.shift();j.apply(b.view.addDiyDom,[b.treeId,c]);b.callback.onNodeCreated&&b.treeObj.trigger(f.event.NODECREATED,[b.treeId,c])}},createNodes:function(b,a,c,d,e){if(c&&c.length!=0){var g=h.getRoot(b),j=b.data.key.children,
j=!d||d.open||!!k(d[j][0],b).get(0);g.createdNodes=[];var a=i.appendNodes(b,a,c,d,e,!0,j),o,m;d?(d=k(d,f.id.UL,b),d.get(0)&&(o=d)):o=b.treeObj;o&&(e>=0&&(m=o.children()[e]),e>=0&&m?q(m).before(a.join("")):o.append(a.join("")));i.createNodeCallback(b)}},destroy:function(b){b&&(h.initCache(b),h.initRoot(b),l.unbindTree(b),l.unbindEvent(b),b.treeObj.empty(),delete r[b.treeId])},expandCollapseNode:function(b,a,c,d,e){var g=h.getRoot(b),n=b.data.key.children;if(a){if(g.expandTriggerFlag){var o=e,e=function(){o&&
o();a.open?b.treeObj.trigger(f.event.EXPAND,[b.treeId,a]):b.treeObj.trigger(f.event.COLLAPSE,[b.treeId,a])};g.expandTriggerFlag=!1}if(!a.open&&a.isParent&&(!k(a,f.id.UL,b).get(0)||a[n]&&a[n].length>0&&!k(a[n][0],b).get(0)))i.appendParentULDom(b,a),i.createNodeCallback(b);if(a.open==c)j.apply(e,[]);else{var c=k(a,f.id.UL,b),g=k(a,f.id.SWITCH,b),m=k(a,f.id.ICON,b);a.isParent?(a.open=!a.open,a.iconOpen&&a.iconClose&&m.attr("style",i.makeNodeIcoStyle(b,a)),a.open?(i.replaceSwitchClass(a,g,f.folder.OPEN),
i.replaceIcoClass(a,m,f.folder.OPEN),d==!1||b.view.expandSpeed==""?(c.show(),j.apply(e,[])):a[n]&&a[n].length>0?c.slideDown(b.view.expandSpeed,e):(c.show(),j.apply(e,[]))):(i.replaceSwitchClass(a,g,f.folder.CLOSE),i.replaceIcoClass(a,m,f.folder.CLOSE),d==!1||b.view.expandSpeed==""||!(a[n]&&a[n].length>0)?(c.hide(),j.apply(e,[])):c.slideUp(b.view.expandSpeed,e))):j.apply(e,[])}}else j.apply(e,[])},expandCollapseParentNode:function(b,a,c,d,e){a&&(a.parentTId?(i.expandCollapseNode(b,a,c,d),a.parentTId&&
i.expandCollapseParentNode(b,a.getParentNode(),c,d,e)):i.expandCollapseNode(b,a,c,d,e))},expandCollapseSonNode:function(b,a,c,d,e){var g=h.getRoot(b),f=b.data.key.children,g=a?a[f]:g[f],f=a?!1:d,j=h.getRoot(b).expandTriggerFlag;h.getRoot(b).expandTriggerFlag=!1;if(g)for(var k=0,l=g.length;k<l;k++)g[k]&&i.expandCollapseSonNode(b,g[k],c,f);h.getRoot(b).expandTriggerFlag=j;i.expandCollapseNode(b,a,c,d,e)},isSelectedNode:function(b,a){if(!a)return!1;var c=h.getRoot(b).curSelectedList,d;for(d=c.length-
1;d>=0;d--)if(a===c[d])return!0;return!1},makeDOMNodeIcon:function(b,a,c){var d=h.getNodeName(a,c),d=a.view.nameIsHTML?d:d.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");b.push("<span id='",c.tId,f.id.ICON,"' title='' treeNode",f.id.ICON," class='",i.makeNodeIcoClass(a,c),"' style='",i.makeNodeIcoStyle(a,c),"'></span><span id='",c.tId,f.id.SPAN,"' class='",f.className.NAME,"'>",d,"</span>")},makeDOMNodeLine:function(b,a,c){b.push("<span id='",c.tId,f.id.SWITCH,"' title='' class='",
i.makeNodeLineClass(a,c),"' treeNode",f.id.SWITCH,"></span>")},makeDOMNodeMainAfter:function(b){b.push("</li>")},makeDOMNodeMainBefore:function(b,a,c){b.push("<li id='",c.tId,"' class='",f.className.LEVEL,c.level,"' tabindex='0' hidefocus='true' treenode>")},makeDOMNodeNameAfter:function(b){b.push("</a>")},makeDOMNodeNameBefore:function(b,a,c){var d=h.getNodeTitle(a,c),e=i.makeNodeUrl(a,c),g=i.makeNodeFontCss(a,c),n=[],k;for(k in g)n.push(k,":",g[k],";");b.push("<a id='",c.tId,f.id.A,"' class='",
f.className.LEVEL,c.level,"' treeNode",f.id.A,' onclick="',c.click||"",'" ',e!=null&&e.length>0?"href='"+e+"'":""," target='",i.makeNodeTarget(c),"' style='",n.join(""),"'");j.apply(a.view.showTitle,[a.treeId,c],a.view.showTitle)&&d&&b.push("title='",d.replace(/'/g,"&#39;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),"'");b.push(">")},makeNodeFontCss:function(b,a){var c=j.apply(b.view.fontCss,[b.treeId,a],b.view.fontCss);return c&&typeof c!="function"?c:{}},makeNodeIcoClass:function(b,a){var c=["ico"];
a.isAjaxing||(c[0]=(a.iconSkin?a.iconSkin+"_":"")+c[0],a.isParent?c.push(a.open?f.folder.OPEN:f.folder.CLOSE):c.push(f.folder.DOCU));return f.className.BUTTON+" "+c.join("_")},makeNodeIcoStyle:function(b,a){var c=[];if(!a.isAjaxing){var d=a.isParent&&a.iconOpen&&a.iconClose?a.open?a.iconOpen:a.iconClose:a[b.data.key.icon];d&&c.push("background:url(",d,") 0 0 no-repeat;");(b.view.showIcon==!1||!j.apply(b.view.showIcon,[b.treeId,a],!0))&&c.push("width:0px;height:0px;")}return c.join("")},makeNodeLineClass:function(b,
a){var c=[];b.view.showLine?a.level==0&&a.isFirstNode&&a.isLastNode?c.push(f.line.ROOT):a.level==0&&a.isFirstNode?c.push(f.line.ROOTS):a.isLastNode?c.push(f.line.BOTTOM):c.push(f.line.CENTER):c.push(f.line.NOLINE);a.isParent?c.push(a.open?f.folder.OPEN:f.folder.CLOSE):c.push(f.folder.DOCU);return i.makeNodeLineClassEx(a)+c.join("_")},makeNodeLineClassEx:function(b){return f.className.BUTTON+" "+f.className.LEVEL+b.level+" "+f.className.SWITCH+" "},makeNodeTarget:function(b){return b.target||"_blank"},
makeNodeUrl:function(b,a){var c=b.data.key.url;return a[c]?a[c]:null},makeUlHtml:function(b,a,c,d){c.push("<ul id='",a.tId,f.id.UL,"' class='",f.className.LEVEL,a.level," ",i.makeUlLineClass(b,a),"' style='display:",a.open?"block":"none","'>");c.push(d);c.push("</ul>")},makeUlLineClass:function(b,a){return b.view.showLine&&!a.isLastNode?f.line.LINE:""},removeChildNodes:function(b,a){if(a){var c=b.data.key.children,d=a[c];if(d){for(var e=0,g=d.length;e<g;e++)h.removeNodeCache(b,d[e]);h.removeSelectedNode(b);
delete a[c];b.data.keep.parent?k(a,f.id.UL,b).empty():(a.isParent=!1,a.open=!1,c=k(a,f.id.SWITCH,b),d=k(a,f.id.ICON,b),i.replaceSwitchClass(a,c,f.folder.DOCU),i.replaceIcoClass(a,d,f.folder.DOCU),k(a,f.id.UL,b).remove())}}},setFirstNode:function(b,a){var c=b.data.key.children;if(a[c].length>0)a[c][0].isFirstNode=!0},setLastNode:function(b,a){var c=b.data.key.children,d=a[c].length;if(d>0)a[c][d-1].isLastNode=!0},removeNode:function(b,a){var c=h.getRoot(b),d=b.data.key.children,e=a.parentTId?a.getParentNode():
c;a.isFirstNode=!1;a.isLastNode=!1;a.getPreNode=function(){return null};a.getNextNode=function(){return null};if(h.getNodeCache(b,a.tId)){k(a,b).remove();h.removeNodeCache(b,a);h.removeSelectedNode(b,a);for(var g=0,j=e[d].length;g<j;g++)if(e[d][g].tId==a.tId){e[d].splice(g,1);break}i.setFirstNode(b,e);i.setLastNode(b,e);var o,g=e[d].length;if(!b.data.keep.parent&&g==0)e.isParent=!1,e.open=!1,g=k(e,f.id.UL,b),j=k(e,f.id.SWITCH,b),o=k(e,f.id.ICON,b),i.replaceSwitchClass(e,j,f.folder.DOCU),i.replaceIcoClass(e,
o,f.folder.DOCU),g.css("display","none");else if(b.view.showLine&&g>0){var m=e[d][g-1],g=k(m,f.id.UL,b),j=k(m,f.id.SWITCH,b);o=k(m,f.id.ICON,b);e==c?e[d].length==1?i.replaceSwitchClass(m,j,f.line.ROOT):(c=k(e[d][0],f.id.SWITCH,b),i.replaceSwitchClass(e[d][0],c,f.line.ROOTS),i.replaceSwitchClass(m,j,f.line.BOTTOM)):i.replaceSwitchClass(m,j,f.line.BOTTOM);g.removeClass(f.line.LINE)}}},replaceIcoClass:function(b,a,c){if(a&&!b.isAjaxing&&(b=a.attr("class"),b!=void 0)){b=b.split("_");switch(c){case f.folder.OPEN:case f.folder.CLOSE:case f.folder.DOCU:b[b.length-
1]=c}a.attr("class",b.join("_"))}},replaceSwitchClass:function(b,a,c){if(a){var d=a.attr("class");if(d!=void 0){d=d.split("_");switch(c){case f.line.ROOT:case f.line.ROOTS:case f.line.CENTER:case f.line.BOTTOM:case f.line.NOLINE:d[0]=i.makeNodeLineClassEx(b)+c;break;case f.folder.OPEN:case f.folder.CLOSE:case f.folder.DOCU:d[1]=c}a.attr("class",d.join("_"));c!==f.folder.DOCU?a.removeAttr("disabled"):a.attr("disabled","disabled")}}},selectNode:function(b,a,c){c||i.cancelPreSelectedNode(b,null,a);k(a,
f.id.A,b).addClass(f.node.CURSELECTED);h.addSelectedNode(b,a);b.treeObj.trigger(f.event.SELECTED,[b.treeId,a])},setNodeFontCss:function(b,a){var c=k(a,f.id.A,b),d=i.makeNodeFontCss(b,a);d&&c.css(d)},setNodeLineIcos:function(b,a){if(a){var c=k(a,f.id.SWITCH,b),d=k(a,f.id.UL,b),e=k(a,f.id.ICON,b),g=i.makeUlLineClass(b,a);g.length==0?d.removeClass(f.line.LINE):d.addClass(g);c.attr("class",i.makeNodeLineClass(b,a));a.isParent?c.removeAttr("disabled"):c.attr("disabled","disabled");e.removeAttr("style");
e.attr("style",i.makeNodeIcoStyle(b,a));e.attr("class",i.makeNodeIcoClass(b,a))}},setNodeName:function(b,a){var c=h.getNodeTitle(b,a),d=k(a,f.id.SPAN,b);d.empty();b.view.nameIsHTML?d.html(h.getNodeName(b,a)):d.text(h.getNodeName(b,a));j.apply(b.view.showTitle,[b.treeId,a],b.view.showTitle)&&k(a,f.id.A,b).attr("title",!c?"":c)},setNodeTarget:function(b,a){k(a,f.id.A,b).attr("target",i.makeNodeTarget(a))},setNodeUrl:function(b,a){var c=k(a,f.id.A,b),d=i.makeNodeUrl(b,a);d==null||d.length==0?c.removeAttr("href"):
c.attr("href",d)},switchNode:function(b,a){a.open||!j.canAsync(b,a)?i.expandCollapseNode(b,a,!a.open):b.async.enable?i.asyncNode(b,a)||i.expandCollapseNode(b,a,!a.open):a&&i.expandCollapseNode(b,a,!a.open)}};q.fn.zTree={consts:{className:{BUTTON:"button",LEVEL:"level",ICO_LOADING:"ico_loading",SWITCH:"switch",NAME:"node_name"},event:{NODECREATED:"ztree_nodeCreated",CLICK:"ztree_click",EXPAND:"ztree_expand",COLLAPSE:"ztree_collapse",ASYNC_SUCCESS:"ztree_async_success",ASYNC_ERROR:"ztree_async_error",
REMOVE:"ztree_remove",SELECTED:"ztree_selected",UNSELECTED:"ztree_unselected"},id:{A:"_a",ICON:"_ico",SPAN:"_span",SWITCH:"_switch",UL:"_ul"},line:{ROOT:"root",ROOTS:"roots",CENTER:"center",BOTTOM:"bottom",NOLINE:"noline",LINE:"line"},folder:{OPEN:"open",CLOSE:"close",DOCU:"docu"},node:{CURSELECTED:"curSelectedNode"}},_z:{tools:j,view:i,event:l,data:h},getZTreeObj:function(b){return(b=h.getZTreeTools(b))?b:null},destroy:function(b){if(b&&b.length>0)i.destroy(h.getSetting(b));else for(var a in r)i.destroy(r[a])},
init:function(b,a,c){var d=j.clone(N);q.extend(!0,d,a);d.treeId=b.attr("id");d.treeObj=b;d.treeObj.empty();r[d.treeId]=d;if(typeof document.body.style.maxHeight==="undefined")d.view.expandSpeed="";h.initRoot(d);b=h.getRoot(d);a=d.data.key.children;c=c?j.clone(j.isArray(c)?c:[c]):[];b[a]=d.data.simpleData.enable?h.transformTozTreeFormat(d,c):c;h.initCache(d);l.unbindTree(d);l.bindTree(d);l.unbindEvent(d);l.bindEvent(d);c={setting:d,addNodes:function(a,b,c,f){function h(){i.addNodes(d,a,b,l,f==!0)}
a||(a=null);if(a&&!a.isParent&&d.data.keep.leaf)return null;var k=parseInt(b,10);isNaN(k)?(f=!!c,c=b,b=-1):b=k;if(!c)return null;var l=j.clone(j.isArray(c)?c:[c]);j.canAsync(d,a)?i.asyncNode(d,a,f,h):h();return l},cancelSelectedNode:function(a){i.cancelPreSelectedNode(d,a)},destroy:function(){i.destroy(d)},expandAll:function(a){a=!!a;i.expandCollapseSonNode(d,null,a,!0);return a},expandNode:function(a,b,c,f,m){function l(){var b=k(a,d).get(0);if(b&&f!==!1)if(b.scrollIntoView)b.scrollIntoView();else try{b.focus().blur()}catch(c){}}
if(!a||!a.isParent)return null;b!==!0&&b!==!1&&(b=!a.open);if((m=!!m)&&b&&j.apply(d.callback.beforeExpand,[d.treeId,a],!0)==!1)return null;else if(m&&!b&&j.apply(d.callback.beforeCollapse,[d.treeId,a],!0)==!1)return null;b&&a.parentTId&&i.expandCollapseParentNode(d,a.getParentNode(),b,!1);if(b===a.open&&!c)return null;h.getRoot(d).expandTriggerFlag=m;!j.canAsync(d,a)&&c?i.expandCollapseSonNode(d,a,b,!0,l):(a.open=!b,i.switchNode(this.setting,a),l());return b},getNodes:function(){return h.getNodes(d)},
getNodeByParam:function(a,b,c){return!a?null:h.getNodeByParam(d,c?c[d.data.key.children]:h.getNodes(d),a,b)},getNodeByTId:function(a){return h.getNodeCache(d,a)},getNodesByParam:function(a,b,c){return!a?null:h.getNodesByParam(d,c?c[d.data.key.children]:h.getNodes(d),a,b)},getNodesByParamFuzzy:function(a,b,c){return!a?null:h.getNodesByParamFuzzy(d,c?c[d.data.key.children]:h.getNodes(d),a,b)},getNodesByFilter:function(a,b,c,f){b=!!b;return!a||typeof a!="function"?b?null:[]:h.getNodesByFilter(d,c?c[d.data.key.children]:
h.getNodes(d),a,b,f)},getNodeIndex:function(a){if(!a)return null;for(var b=d.data.key.children,c=a.parentTId?a.getParentNode():h.getRoot(d),f=0,i=c[b].length;f<i;f++)if(c[b][f]==a)return f;return-1},getSelectedNodes:function(){for(var a=[],b=h.getRoot(d).curSelectedList,c=0,f=b.length;c<f;c++)a.push(b[c]);return a},isSelectedNode:function(a){return h.isSelectedNode(d,a)},reAsyncChildNodes:function(a,b,c){if(this.setting.async.enable){var j=!a;j&&(a=h.getRoot(d));if(b=="refresh"){for(var b=this.setting.data.key.children,
m=0,l=a[b]?a[b].length:0;m<l;m++)h.removeNodeCache(d,a[b][m]);h.removeSelectedNode(d);a[b]=[];j?this.setting.treeObj.empty():k(a,f.id.UL,d).empty()}i.asyncNode(this.setting,j?null:a,!!c)}},refresh:function(){this.setting.treeObj.empty();var a=h.getRoot(d),b=a[d.data.key.children];h.initRoot(d);a[d.data.key.children]=b;h.initCache(d);i.createNodes(d,0,a[d.data.key.children],null,-1)},removeChildNodes:function(a){if(!a)return null;var b=a[d.data.key.children];i.removeChildNodes(d,a);return b?b:null},
removeNode:function(a,b){a&&(b=!!b,b&&j.apply(d.callback.beforeRemove,[d.treeId,a],!0)==!1||(i.removeNode(d,a),b&&this.setting.treeObj.trigger(f.event.REMOVE,[d.treeId,a])))},selectNode:function(a,b){function c(){var b=k(a,d).get(0);if(b)if(b.scrollIntoView)b.scrollIntoView();else try{b.focus().blur()}catch(f){}}if(a&&j.uCanDo(d)){b=d.view.selectedMulti&&b;if(a.parentTId)i.expandCollapseParentNode(d,a.getParentNode(),!0,!1,c);else try{k(a,d).focus().blur()}catch(f){}i.selectNode(d,a,b)}},transformTozTreeNodes:function(a){return h.transformTozTreeFormat(d,
a)},transformToArray:function(a){return h.transformToArrayFormat(d,a)},updateNode:function(a){a&&k(a,d).get(0)&&j.uCanDo(d)&&(i.setNodeName(d,a),i.setNodeTarget(d,a),i.setNodeUrl(d,a),i.setNodeLineIcos(d,a),i.setNodeFontCss(d,a))}};b.treeTools=c;h.setZTreeTools(d,c);b[a]&&b[a].length>0?i.createNodes(d,0,b[a],null,-1):d.async.enable&&d.async.url&&d.async.url!==""&&i.asyncNode(d);return c}};var O=q.fn.zTree,k=j.$,f=O.consts})(jQuery);

/*!
 * jQuery Validation Plugin v1.15.0
 *
 * http://jqueryvalidation.org/
 *
 * Copyright (c) 2016 Jörn Zaefferer
 * Released under the MIT license
 */
(function( factory ) {
	if ( typeof define === "function" && define.amd ) {
		define( ["jquery"], factory );
	} else if (typeof module === "object" && module.exports) {
		module.exports = factory( require( "jquery" ) );
	} else {
		factory( jQuery );
	}
}(function( $ ) {

$.extend( $.fn, {

	// http://jqueryvalidation.org/validate/
	validate: function( options ) {

		// If nothing is selected, return nothing; can't chain anyway
		if ( !this.length ) {
			if ( options && options.debug && window.console ) {
				console.warn( "Nothing selected, can't validate, returning nothing." );
			}
			return;
		}

		// Check if a validator for this form was already created
		var validator = $.data( this[ 0 ], "validator" );
		if ( validator ) {
			return validator;
		}

		// Add novalidate tag if HTML5.
		this.attr( "novalidate", "novalidate" );

		validator = new $.validator( options, this[ 0 ] );
		$.data( this[ 0 ], "validator", validator );

		if ( validator.settings.onsubmit ) {

			this.on( "click.validate", ":submit", function( event ) {
				if ( validator.settings.submitHandler ) {
					validator.submitButton = event.target;
				}

				// Allow suppressing validation by adding a cancel class to the submit button
				if ( $( this ).hasClass( "cancel" ) ) {
					validator.cancelSubmit = true;
				}

				// Allow suppressing validation by adding the html5 formnovalidate attribute to the submit button
				if ( $( this ).attr( "formnovalidate" ) !== undefined ) {
					validator.cancelSubmit = true;
				}
			} );

			// Validate the form on submit
			this.on( "submit.validate", function( event ) {
				if ( validator.settings.debug ) {

					// Prevent form submit to be able to see console output
					event.preventDefault();
				}
				function handle() {
					var hidden, result;
					if ( validator.settings.submitHandler ) {
						if ( validator.submitButton ) {

							// Insert a hidden input as a replacement for the missing submit button
							hidden = $( "<input type='hidden'/>" )
								.attr( "name", validator.submitButton.name )
								.val( $( validator.submitButton ).val() )
								.appendTo( validator.currentForm );
						}
						result = validator.settings.submitHandler.call( validator, validator.currentForm, event );
						if ( validator.submitButton ) {

							// And clean up afterwards; thanks to no-block-scope, hidden can be referenced
							hidden.remove();
						}
						if ( result !== undefined ) {
							return result;
						}
						return false;
					}
					return true;
				}

				// Prevent submit for invalid forms or custom submit handlers
				if ( validator.cancelSubmit ) {
					validator.cancelSubmit = false;
					return handle();
				}
				if ( validator.form() ) {
					if ( validator.pendingRequest ) {
						validator.formSubmitted = true;
						return false;
					}
					return handle();
				} else {
					validator.focusInvalid();
					return false;
				}
			} );
		}

		return validator;
	},

	// http://jqueryvalidation.org/valid/
	valid: function() {
		var valid, validator, errorList;

		if ( $( this[ 0 ] ).is( "form" ) ) {
			valid = this.validate().form();
		} else {
			errorList = [];
			valid = true;
			validator = $( this[ 0 ].form ).validate();
			this.each( function() {
				valid = validator.element( this ) && valid;
				if ( !valid ) {
					errorList = errorList.concat( validator.errorList );
				}
			} );
			validator.errorList = errorList;
		}
		return valid;
	},

	// http://jqueryvalidation.org/rules/
	rules: function( command, argument ) {

		// If nothing is selected, return nothing; can't chain anyway
		if ( !this.length ) {
			return;
		}

		var element = this[ 0 ],
			settings, staticRules, existingRules, data, param, filtered;

		if ( command ) {
			settings = $.data( element.form, "validator" ).settings;
			staticRules = settings.rules;
			existingRules = $.validator.staticRules( element );
			switch ( command ) {
			case "add":
				$.extend( existingRules, $.validator.normalizeRule( argument ) );

				// Remove messages from rules, but allow them to be set separately
				delete existingRules.messages;
				staticRules[ element.name ] = existingRules;
				if ( argument.messages ) {
					settings.messages[ element.name ] = $.extend( settings.messages[ element.name ], argument.messages );
				}
				break;
			case "remove":
				if ( !argument ) {
					delete staticRules[ element.name ];
					return existingRules;
				}
				filtered = {};
				$.each( argument.split( /\s/ ), function( index, method ) {
					filtered[ method ] = existingRules[ method ];
					delete existingRules[ method ];
					if ( method === "required" ) {
						$( element ).removeAttr( "aria-required" );
					}
				} );
				return filtered;
			}
		}

		data = $.validator.normalizeRules(
		$.extend(
			{},
			$.validator.classRules( element ),
			$.validator.attributeRules( element ),
			$.validator.dataRules( element ),
			$.validator.staticRules( element )
		), element );

		// Make sure required is at front
		if ( data.required ) {
			param = data.required;
			delete data.required;
			data = $.extend( { required: param }, data );
			$( element ).attr( "aria-required", "true" );
		}

		// Make sure remote is at back
		if ( data.remote ) {
			param = data.remote;
			delete data.remote;
			data = $.extend( data, { remote: param } );
		}

		return data;
	}
} );

// Custom selectors
$.extend( $.expr[ ":" ], {

	// http://jqueryvalidation.org/blank-selector/
	blank: function( a ) {
		return !$.trim( "" + $( a ).val() );
	},

	// http://jqueryvalidation.org/filled-selector/
	filled: function( a ) {
		var val = $( a ).val();
		return val !== null && !!$.trim( "" + val );
	},

	// http://jqueryvalidation.org/unchecked-selector/
	unchecked: function( a ) {
		return !$( a ).prop( "checked" );
	}
} );

// Constructor for validator
$.validator = function( options, form ) {
	this.settings = $.extend( true, {}, $.validator.defaults, options );
	this.currentForm = form;
	this.init();
};

// http://jqueryvalidation.org/jQuery.validator.format/
$.validator.format = function( source, params ) {
	if ( arguments.length === 1 ) {
		return function() {
			var args = $.makeArray( arguments );
			args.unshift( source );
			return $.validator.format.apply( this, args );
		};
	}
	if ( params === undefined ) {
		return source;
	}
	if ( arguments.length > 2 && params.constructor !== Array  ) {
		params = $.makeArray( arguments ).slice( 1 );
	}
	if ( params.constructor !== Array ) {
		params = [ params ];
	}
	$.each( params, function( i, n ) {
		source = source.replace( new RegExp( "\\{" + i + "\\}", "g" ), function() {
			return n;
		} );
	} );
	return source;
};

$.extend( $.validator, {

	defaults: {
		messages: {},
		groups: {},
		rules: {},
		errorClass: "error",
		pendingClass: "pending",
		validClass: "valid",
		errorElement: "label",
		focusCleanup: false,
		focusInvalid: true,
		errorContainer: $( [] ),
		errorLabelContainer: $( [] ),
		onsubmit: true,
		ignore: ":hidden",
		ignoreTitle: false,
		onfocusin: function( element ) {
			this.lastActive = element;

			// Hide error label and remove error class on focus if enabled
			if ( this.settings.focusCleanup ) {
				if ( this.settings.unhighlight ) {
					this.settings.unhighlight.call( this, element, this.settings.errorClass, this.settings.validClass );
				}
				this.hideThese( this.errorsFor( element ) );
			}
		},
		onfocusout: function( element ) {
			if ( !this.checkable( element ) && ( element.name in this.submitted || !this.optional( element ) ) ) {
				this.element( element );
			}
		},
		onkeyup: function( element, event ) {

			// Avoid revalidate the field when pressing one of the following keys
			// Shift       => 16
			// Ctrl        => 17
			// Alt         => 18
			// Caps lock   => 20
			// End         => 35
			// Home        => 36
			// Left arrow  => 37
			// Up arrow    => 38
			// Right arrow => 39
			// Down arrow  => 40
			// Insert      => 45
			// Num lock    => 144
			// AltGr key   => 225
			var excludedKeys = [
				16, 17, 18, 20, 35, 36, 37,
				38, 39, 40, 45, 144, 225
			];

			if ( event.which === 9 && this.elementValue( element ) === "" || $.inArray( event.keyCode, excludedKeys ) !== -1 ) {
				return;
			} else if ( element.name in this.submitted || element.name in this.invalid ) {
				this.element( element );
			}
		},
		onclick: function( element ) {

			// Click on selects, radiobuttons and checkboxes
			if ( element.name in this.submitted ) {
				this.element( element );

			// Or option elements, check parent select in that case
			} else if ( element.parentNode.name in this.submitted ) {
				this.element( element.parentNode );
			}
		},
		highlight: function( element, errorClass, validClass ) {
			if ( element.type === "radio" ) {
				this.findByName( element.name ).addClass( errorClass ).removeClass( validClass );
			} else {
				$( element ).addClass( errorClass ).removeClass( validClass );
			}
		},
		unhighlight: function( element, errorClass, validClass ) {
			if ( element.type === "radio" ) {
				this.findByName( element.name ).removeClass( errorClass ).addClass( validClass );
			} else {
				$( element ).removeClass( errorClass ).addClass( validClass );
			}
		}
	},

	// http://jqueryvalidation.org/jQuery.validator.setDefaults/
	setDefaults: function( settings ) {
		$.extend( $.validator.defaults, settings );
	},

	messages: {
		required: "This field is required.",
		remote: "Please fix this field.",
		email: "Please enter a valid email address.",
		url: "Please enter a valid URL.",
		date: "Please enter a valid date.",
		dateISO: "Please enter a valid date ( ISO ).",
		number: "Please enter a valid number.",
		digits: "Please enter only digits.",
		equalTo: "Please enter the same value again.",
		maxlength: $.validator.format( "Please enter no more than {0} characters." ),
		minlength: $.validator.format( "Please enter at least {0} characters." ),
		rangelength: $.validator.format( "Please enter a value between {0} and {1} characters long." ),
		range: $.validator.format( "Please enter a value between {0} and {1}." ),
		max: $.validator.format( "Please enter a value less than or equal to {0}." ),
		min: $.validator.format( "Please enter a value greater than or equal to {0}." ),
		step: $.validator.format( "Please enter a multiple of {0}." )
	},

	autoCreateRanges: false,

	prototype: {

		init: function() {
			this.labelContainer = $( this.settings.errorLabelContainer );
			this.errorContext = this.labelContainer.length && this.labelContainer || $( this.currentForm );
			this.containers = $( this.settings.errorContainer ).add( this.settings.errorLabelContainer );
			this.submitted = {};
			this.valueCache = {};
			this.pendingRequest = 0;
			this.pending = {};
			this.invalid = {};
			this.reset();

			var groups = ( this.groups = {} ),
				rules;
			$.each( this.settings.groups, function( key, value ) {
				if ( typeof value === "string" ) {
					value = value.split( /\s/ );
				}
				$.each( value, function( index, name ) {
					groups[ name ] = key;
				} );
			} );
			rules = this.settings.rules;
			$.each( rules, function( key, value ) {
				rules[ key ] = $.validator.normalizeRule( value );
			} );

			function delegate( event ) {
				var validator = $.data( this.form, "validator" ),
					eventType = "on" + event.type.replace( /^validate/, "" ),
					settings = validator.settings;
				if ( settings[ eventType ] && !$( this ).is( settings.ignore ) ) {
					settings[ eventType ].call( validator, this, event );
				}
			}

			$( this.currentForm )
				.on( "focusin.validate focusout.validate keyup.validate",
					":text, [type='password'], [type='file'], select, textarea, [type='number'], [type='search'], " +
					"[type='tel'], [type='url'], [type='email'], [type='datetime'], [type='date'], [type='month'], " +
					"[type='week'], [type='time'], [type='datetime-local'], [type='range'], [type='color'], " +
					"[type='radio'], [type='checkbox'], [contenteditable]", delegate )

				// Support: Chrome, oldIE
				// "select" is provided as event.target when clicking a option
				.on( "click.validate", "select, option, [type='radio'], [type='checkbox']", delegate );

			if ( this.settings.invalidHandler ) {
				$( this.currentForm ).on( "invalid-form.validate", this.settings.invalidHandler );
			}

			// Add aria-required to any Static/Data/Class required fields before first validation
			// Screen readers require this attribute to be present before the initial submission http://www.w3.org/TR/WCAG-TECHS/ARIA2.html
			$( this.currentForm ).find( "[required], [data-rule-required], .required" ).attr( "aria-required", "true" );
		},

		// http://jqueryvalidation.org/Validator.form/
		form: function() {
			this.checkForm();
			$.extend( this.submitted, this.errorMap );
			this.invalid = $.extend( {}, this.errorMap );
			if ( !this.valid() ) {
				$( this.currentForm ).triggerHandler( "invalid-form", [ this ] );
			}
			this.showErrors();
			return this.valid();
		},

		checkForm: function() {
			this.prepareForm();
			for ( var i = 0, elements = ( this.currentElements = this.elements() ); elements[ i ]; i++ ) {
				this.check( elements[ i ] );
			}
			return this.valid();
		},

		// http://jqueryvalidation.org/Validator.element/
		element: function( element ) {
			var cleanElement = this.clean( element ),
				checkElement = this.validationTargetFor( cleanElement ),
				v = this,
				result = true,
				rs, group;

			if ( checkElement === undefined ) {
				delete this.invalid[ cleanElement.name ];
			} else {
				this.prepareElement( checkElement );
				this.currentElements = $( checkElement );

				// If this element is grouped, then validate all group elements already
				// containing a value
				group = this.groups[ checkElement.name ];
				if ( group ) {
					$.each( this.groups, function( name, testgroup ) {
						if ( testgroup === group && name !== checkElement.name ) {
							cleanElement = v.validationTargetFor( v.clean( v.findByName( name ) ) );
							if ( cleanElement && cleanElement.name in v.invalid ) {
								v.currentElements.push( cleanElement );
								result = result && v.check( cleanElement );
							}
						}
					} );
				}

				rs = this.check( checkElement ) !== false;
				result = result && rs;
				if ( rs ) {
					this.invalid[ checkElement.name ] = false;
				} else {
					this.invalid[ checkElement.name ] = true;
				}

				if ( !this.numberOfInvalids() ) {

					// Hide error containers on last error
					this.toHide = this.toHide.add( this.containers );
				}
				this.showErrors();

				// Add aria-invalid status for screen readers
				$( element ).attr( "aria-invalid", !rs );
			}

			return result;
		},

		// http://jqueryvalidation.org/Validator.showErrors/
		showErrors: function( errors ) {
			if ( errors ) {
				var validator = this;

				// Add items to error list and map
				$.extend( this.errorMap, errors );
				this.errorList = $.map( this.errorMap, function( message, name ) {
					return {
						message: message,
						element: validator.findByName( name )[ 0 ]
					};
				} );

				// Remove items from success list
				this.successList = $.grep( this.successList, function( element ) {
					return !( element.name in errors );
				} );
			}
			if ( this.settings.showErrors ) {
				this.settings.showErrors.call( this, this.errorMap, this.errorList );
			} else {
				this.defaultShowErrors();
			}
		},

		// http://jqueryvalidation.org/Validator.resetForm/
		resetForm: function() {
			if ( $.fn.resetForm ) {
				$( this.currentForm ).resetForm();
			}
			this.invalid = {};
			this.submitted = {};
			this.prepareForm();
			this.hideErrors();
			var elements = this.elements()
				.removeData( "previousValue" )
				.removeAttr( "aria-invalid" );

			this.resetElements( elements );
		},

		resetElements: function( elements ) {
			var i;

			if ( this.settings.unhighlight ) {
				for ( i = 0; elements[ i ]; i++ ) {
					this.settings.unhighlight.call( this, elements[ i ],
						this.settings.errorClass, "" );
					this.findByName( elements[ i ].name ).removeClass( this.settings.validClass );
				}
			} else {
				elements
					.removeClass( this.settings.errorClass )
					.removeClass( this.settings.validClass );
			}
		},

		numberOfInvalids: function() {
			return this.objectLength( this.invalid );
		},

		objectLength: function( obj ) {
			/* jshint unused: false */
			var count = 0,
				i;
			for ( i in obj ) {
				if ( obj[ i ] ) {
					count++;
				}
			}
			return count;
		},

		hideErrors: function() {
			this.hideThese( this.toHide );
		},

		hideThese: function( errors ) {
			errors.not( this.containers ).text( "" );
			this.addWrapper( errors ).hide();
		},

		valid: function() {
			return this.size() === 0;
		},

		size: function() {
			return this.errorList.length;
		},

		focusInvalid: function() {
			if ( this.settings.focusInvalid ) {
				try {
					$( this.findLastActive() || this.errorList.length && this.errorList[ 0 ].element || [] )
					.filter( ":visible" )
					.focus()

					// Manually trigger focusin event; without it, focusin handler isn't called, findLastActive won't have anything to find
					.trigger( "focusin" );
				} catch ( e ) {

					// Ignore IE throwing errors when focusing hidden elements
				}
			}
		},

		findLastActive: function() {
			var lastActive = this.lastActive;
			return lastActive && $.grep( this.errorList, function( n ) {
				return n.element.name === lastActive.name;
			} ).length === 1 && lastActive;
		},

		elements: function() {
			var validator = this,
				rulesCache = {};

			// Select all valid inputs inside the form (no submit or reset buttons)
			return $( this.currentForm )
			.find( "input, select, textarea, [contenteditable]" )
			.not( ":submit, :reset, :image, :disabled" )
			.not( this.settings.ignore )
			.filter( function() {
				var name = this.name || $( this ).attr( "name" ); // For contenteditable
				if ( !name && validator.settings.debug && window.console ) {
					console.error( "%o has no name assigned", this );
				}

				// Set form expando on contenteditable
				if ( this.hasAttribute( "contenteditable" ) ) {
					this.form = $( this ).closest( "form" )[ 0 ];
				}

				// Select only the first element for each name, and only those with rules specified
				if ( name in rulesCache || !validator.objectLength( $( this ).rules() ) ) {
					return false;
				}

				rulesCache[ name ] = true;
				return true;
			} );
		},

		clean: function( selector ) {
			return $( selector )[ 0 ];
		},

		errors: function() {
			var errorClass = this.settings.errorClass.split( " " ).join( "." );
			return $( this.settings.errorElement + "." + errorClass, this.errorContext );
		},

		resetInternals: function() {
			this.successList = [];
			this.errorList = [];
			this.errorMap = {};
			this.toShow = $( [] );
			this.toHide = $( [] );
		},

		reset: function() {
			this.resetInternals();
			this.currentElements = $( [] );
		},

		prepareForm: function() {
			this.reset();
			this.toHide = this.errors().add( this.containers );
		},

		prepareElement: function( element ) {
			this.reset();
			this.toHide = this.errorsFor( element );
		},

		elementValue: function( element ) {
			var $element = $( element ),
				type = element.type,
				val, idx;

			if ( type === "radio" || type === "checkbox" ) {
				return this.findByName( element.name ).filter( ":checked" ).val();
			} else if ( type === "number" && typeof element.validity !== "undefined" ) {
				return element.validity.badInput ? "NaN" : $element.val();
			}

			if ( element.hasAttribute( "contenteditable" ) ) {
				val = $element.text();
			} else {
				val = $element.val();
			}

			if ( type === "file" ) {

				// Modern browser (chrome & safari)
				if ( val.substr( 0, 12 ) === "C:\\fakepath\\" ) {
					return val.substr( 12 );
				}

				// Legacy browsers
				// Unix-based path
				idx = val.lastIndexOf( "/" );
				if ( idx >= 0 ) {
					return val.substr( idx + 1 );
				}

				// Windows-based path
				idx = val.lastIndexOf( "\\" );
				if ( idx >= 0 ) {
					return val.substr( idx + 1 );
				}

				// Just the file name
				return val;
			}

			if ( typeof val === "string" ) {
				return val.replace( /\r/g, "" );
			}
			return val;
		},

		check: function( element ) {
			element = this.validationTargetFor( this.clean( element ) );

			var rules = $( element ).rules(),
				rulesCount = $.map( rules, function( n, i ) {
					return i;
				} ).length,
				dependencyMismatch = false,
				val = this.elementValue( element ),
				result, method, rule;

			// If a normalizer is defined for this element, then
			// call it to retreive the changed value instead
			// of using the real one.
			// Note that `this` in the normalizer is `element`.
			if ( typeof rules.normalizer === "function" ) {
				val = rules.normalizer.call( element, val );

				if ( typeof val !== "string" ) {
					throw new TypeError( "The normalizer should return a string value." );
				}

				// Delete the normalizer from rules to avoid treating
				// it as a pre-defined method.
				delete rules.normalizer;
			}

			for ( method in rules ) {
				rule = { method: method, parameters: rules[ method ] };
				try {
					result = $.validator.methods[ method ].call( this, val, element, rule.parameters );

					// If a method indicates that the field is optional and therefore valid,
					// don't mark it as valid when there are no other rules
					if ( result === "dependency-mismatch" && rulesCount === 1 ) {
						dependencyMismatch = true;
						continue;
					}
					dependencyMismatch = false;

					if ( result === "pending" ) {
						this.toHide = this.toHide.not( this.errorsFor( element ) );
						return;
					}

					if ( !result ) {
						this.formatAndAdd( element, rule );
						return false;
					}
				} catch ( e ) {
					if ( this.settings.debug && window.console ) {
						console.log( "Exception occurred when checking element " + element.id + ", check the '" + rule.method + "' method.", e );
					}
					if ( e instanceof TypeError ) {
						e.message += ".  Exception occurred when checking element " + element.id + ", check the '" + rule.method + "' method.";
					}

					throw e;
				}
			}
			if ( dependencyMismatch ) {
				return;
			}
			if ( this.objectLength( rules ) ) {
				this.successList.push( element );
			}
			return true;
		},

		// Return the custom message for the given element and validation method
		// specified in the element's HTML5 data attribute
		// return the generic message if present and no method specific message is present
		customDataMessage: function( element, method ) {
			return $( element ).data( "msg" + method.charAt( 0 ).toUpperCase() +
				method.substring( 1 ).toLowerCase() ) || $( element ).data( "msg" );
		},

		// Return the custom message for the given element name and validation method
		customMessage: function( name, method ) {
			var m = this.settings.messages[ name ];
			return m && ( m.constructor === String ? m : m[ method ] );
		},

		// Return the first defined argument, allowing empty strings
		findDefined: function() {
			for ( var i = 0; i < arguments.length; i++ ) {
				if ( arguments[ i ] !== undefined ) {
					return arguments[ i ];
				}
			}
			return undefined;
		},

		defaultMessage: function( element, rule ) {
			var message = this.findDefined(
					this.customMessage( element.name, rule.method ),
					this.customDataMessage( element, rule.method ),

					// 'title' is never undefined, so handle empty string as undefined
					!this.settings.ignoreTitle && element.title || undefined,
					$.validator.messages[ rule.method ],
					"<strong>Warning: No message defined for " + element.name + "</strong>"
				),
				theregex = /\$?\{(\d+)\}/g;
			if ( typeof message === "function" ) {
				message = message.call( this, rule.parameters, element );
			} else if ( theregex.test( message ) ) {
				message = $.validator.format( message.replace( theregex, "{$1}" ), rule.parameters );
			}

			return message;
		},

		formatAndAdd: function( element, rule ) {
			var message = this.defaultMessage( element, rule );

			this.errorList.push( {
				message: message,
				element: element,
				method: rule.method
			} );

			this.errorMap[ element.name ] = message;
			this.submitted[ element.name ] = message;
		},

		addWrapper: function( toToggle ) {
			if ( this.settings.wrapper ) {
				toToggle = toToggle.add( toToggle.parent( this.settings.wrapper ) );
			}
			return toToggle;
		},

		defaultShowErrors: function() {
			var i, elements, error;
			for ( i = 0; this.errorList[ i ]; i++ ) {
				error = this.errorList[ i ];
				if ( this.settings.highlight ) {
					this.settings.highlight.call( this, error.element, this.settings.errorClass, this.settings.validClass );
				}
				this.showLabel( error.element, error.message );
			}
			if ( this.errorList.length ) {
				this.toShow = this.toShow.add( this.containers );
			}
			if ( this.settings.success ) {
				for ( i = 0; this.successList[ i ]; i++ ) {
					this.showLabel( this.successList[ i ] );
				}
			}
			if ( this.settings.unhighlight ) {
				for ( i = 0, elements = this.validElements(); elements[ i ]; i++ ) {
					this.settings.unhighlight.call( this, elements[ i ], this.settings.errorClass, this.settings.validClass );
				}
			}
			this.toHide = this.toHide.not( this.toShow );
			this.hideErrors();
			this.addWrapper( this.toShow ).show();
		},

		validElements: function() {
			return this.currentElements.not( this.invalidElements() );
		},

		invalidElements: function() {
			return $( this.errorList ).map( function() {
				return this.element;
			} );
		},

		showLabel: function( element, message ) {
			var place, group, errorID, v,
				error = this.errorsFor( element ),
				elementID = this.idOrName( element ),
				describedBy = $( element ).attr( "aria-describedby" );

			if ( error.length ) {

				// Refresh error/success class
				error.removeClass( this.settings.validClass ).addClass( this.settings.errorClass );

				// Replace message on existing label
				error.html( message );
			} else {

				// Create error element
				error = $( "<" + this.settings.errorElement + ">" )
					.attr( "id", elementID + "-error" )
					.addClass( this.settings.errorClass )
					.html( message || "" );

				// Maintain reference to the element to be placed into the DOM
				place = error;
				if ( this.settings.wrapper ) {

					// Make sure the element is visible, even in IE
					// actually showing the wrapped element is handled elsewhere
					place = error.hide().show().wrap( "<" + this.settings.wrapper + "/>" ).parent();
				}
				if ( this.labelContainer.length ) {
					this.labelContainer.append( place );
				} else if ( this.settings.errorPlacement ) {
					this.settings.errorPlacement( place, $( element ) );
				} else {
					place.insertAfter( element );
				}

				// Link error back to the element
				if ( error.is( "label" ) ) {

					// If the error is a label, then associate using 'for'
					error.attr( "for", elementID );

					// If the element is not a child of an associated label, then it's necessary
					// to explicitly apply aria-describedby
				} else if ( error.parents( "label[for='" + this.escapeCssMeta( elementID ) + "']" ).length === 0 ) {
					errorID = error.attr( "id" );

					// Respect existing non-error aria-describedby
					if ( !describedBy ) {
						describedBy = errorID;
					} else if ( !describedBy.match( new RegExp( "\\b" + this.escapeCssMeta( errorID ) + "\\b" ) ) ) {

						// Add to end of list if not already present
						describedBy += " " + errorID;
					}
					$( element ).attr( "aria-describedby", describedBy );

					// If this element is grouped, then assign to all elements in the same group
					group = this.groups[ element.name ];
					if ( group ) {
						v = this;
						$.each( v.groups, function( name, testgroup ) {
							if ( testgroup === group ) {
								$( "[name='" + v.escapeCssMeta( name ) + "']", v.currentForm )
									.attr( "aria-describedby", error.attr( "id" ) );
							}
						} );
					}
				}
			}
			if ( !message && this.settings.success ) {
				error.text( "" );
				if ( typeof this.settings.success === "string" ) {
					error.addClass( this.settings.success );
				} else {
					this.settings.success( error, element );
				}
			}
			this.toShow = this.toShow.add( error );
		},

		errorsFor: function( element ) {
			var name = this.escapeCssMeta( this.idOrName( element ) ),
				describer = $( element ).attr( "aria-describedby" ),
				selector = "label[for='" + name + "'], label[for='" + name + "'] *";

			// 'aria-describedby' should directly reference the error element
			if ( describer ) {
				selector = selector + ", #" + this.escapeCssMeta( describer )
					.replace( /\s+/g, ", #" );
			}

			return this
				.errors()
				.filter( selector );
		},

		// See https://api.jquery.com/category/selectors/, for CSS
		// meta-characters that should be escaped in order to be used with JQuery
		// as a literal part of a name/id or any selector.
		escapeCssMeta: function( string ) {
			return string.replace( /([\\!"#$%&'()*+,./:;<=>?@\[\]^`{|}~])/g, "\\$1" );
		},

		idOrName: function( element ) {
			return this.groups[ element.name ] || ( this.checkable( element ) ? element.name : element.id || element.name );
		},

		validationTargetFor: function( element ) {

			// If radio/checkbox, validate first element in group instead
			if ( this.checkable( element ) ) {
				element = this.findByName( element.name );
			}

			// Always apply ignore filter
			return $( element ).not( this.settings.ignore )[ 0 ];
		},

		checkable: function( element ) {
			return ( /radio|checkbox/i ).test( element.type );
		},

		findByName: function( name ) {
			return $( this.currentForm ).find( "[name='" + this.escapeCssMeta( name ) + "']" );
		},

		getLength: function( value, element ) {
			switch ( element.nodeName.toLowerCase() ) {
			case "select":
				return $( "option:selected", element ).length;
			case "input":
				if ( this.checkable( element ) ) {
					return this.findByName( element.name ).filter( ":checked" ).length;
				}
			}
			return value.length;
		},

		depend: function( param, element ) {
			return this.dependTypes[ typeof param ] ? this.dependTypes[ typeof param ]( param, element ) : true;
		},

		dependTypes: {
			"boolean": function( param ) {
				return param;
			},
			"string": function( param, element ) {
				return !!$( param, element.form ).length;
			},
			"function": function( param, element ) {
				return param( element );
			}
		},

		optional: function( element ) {
			var val = this.elementValue( element );
			return !$.validator.methods.required.call( this, val, element ) && "dependency-mismatch";
		},

		startRequest: function( element ) {
			if ( !this.pending[ element.name ] ) {
				this.pendingRequest++;
				$( element ).addClass( this.settings.pendingClass );
				this.pending[ element.name ] = true;
			}
		},

		stopRequest: function( element, valid ) {
			this.pendingRequest--;

			// Sometimes synchronization fails, make sure pendingRequest is never < 0
			if ( this.pendingRequest < 0 ) {
				this.pendingRequest = 0;
			}
			delete this.pending[ element.name ];
			$( element ).removeClass( this.settings.pendingClass );
			if ( valid && this.pendingRequest === 0 && this.formSubmitted && this.form() ) {
				$( this.currentForm ).submit();
				this.formSubmitted = false;
			} else if ( !valid && this.pendingRequest === 0 && this.formSubmitted ) {
				$( this.currentForm ).triggerHandler( "invalid-form", [ this ] );
				this.formSubmitted = false;
			}
		},

		previousValue: function( element, method ) {
			return $.data( element, "previousValue" ) || $.data( element, "previousValue", {
				old: null,
				valid: true,
				message: this.defaultMessage( element, { method: method } )
			} );
		},

		// Cleans up all forms and elements, removes validator-specific events
		destroy: function() {
			this.resetForm();

			$( this.currentForm )
				.off( ".validate" )
				.removeData( "validator" )
				.find( ".validate-equalTo-blur" )
					.off( ".validate-equalTo" )
					.removeClass( "validate-equalTo-blur" );
		}

	},

	classRuleSettings: {
		required: { required: true },
		email: { email: true },
		url: { url: true },
		date: { date: true },
		dateISO: { dateISO: true },
		number: { number: true },
		digits: { digits: true },
		creditcard: { creditcard: true }
	},

	addClassRules: function( className, rules ) {
		if ( className.constructor === String ) {
			this.classRuleSettings[ className ] = rules;
		} else {
			$.extend( this.classRuleSettings, className );
		}
	},

	classRules: function( element ) {
		var rules = {},
			classes = $( element ).attr( "class" );

		if ( classes ) {
			$.each( classes.split( " " ), function() {
				if ( this in $.validator.classRuleSettings ) {
					$.extend( rules, $.validator.classRuleSettings[ this ] );
				}
			} );
		}
		return rules;
	},

	normalizeAttributeRule: function( rules, type, method, value ) {

		// Convert the value to a number for number inputs, and for text for backwards compability
		// allows type="date" and others to be compared as strings
		if ( /min|max|step/.test( method ) && ( type === null || /number|range|text/.test( type ) ) ) {
			value = Number( value );

			// Support Opera Mini, which returns NaN for undefined minlength
			if ( isNaN( value ) ) {
				value = undefined;
			}
		}

		if ( value || value === 0 ) {
			rules[ method ] = value;
		} else if ( type === method && type !== "range" ) {

			// Exception: the jquery validate 'range' method
			// does not test for the html5 'range' type
			rules[ method ] = true;
		}
	},

	attributeRules: function( element ) {
		var rules = {},
			$element = $( element ),
			type = element.getAttribute( "type" ),
			method, value;

		for ( method in $.validator.methods ) {

			// Support for <input required> in both html5 and older browsers
			if ( method === "required" ) {
				value = element.getAttribute( method );

				// Some browsers return an empty string for the required attribute
				// and non-HTML5 browsers might have required="" markup
				if ( value === "" ) {
					value = true;
				}

				// Force non-HTML5 browsers to return bool
				value = !!value;
			} else {
				value = $element.attr( method );
			}

			this.normalizeAttributeRule( rules, type, method, value );
		}

		// 'maxlength' may be returned as -1, 2147483647 ( IE ) and 524288 ( safari ) for text inputs
		if ( rules.maxlength && /-1|2147483647|524288/.test( rules.maxlength ) ) {
			delete rules.maxlength;
		}

		return rules;
	},

	dataRules: function( element ) {
		var rules = {},
			$element = $( element ),
			type = element.getAttribute( "type" ),
			method, value;

		for ( method in $.validator.methods ) {
			value = $element.data( "rule" + method.charAt( 0 ).toUpperCase() + method.substring( 1 ).toLowerCase() );
			this.normalizeAttributeRule( rules, type, method, value );
		}
		return rules;
	},

	staticRules: function( element ) {
		var rules = {},
			validator = $.data( element.form, "validator" );

		if ( validator.settings.rules ) {
			rules = $.validator.normalizeRule( validator.settings.rules[ element.name ] ) || {};
		}
		return rules;
	},

	normalizeRules: function( rules, element ) {

		// Handle dependency check
		$.each( rules, function( prop, val ) {

			// Ignore rule when param is explicitly false, eg. required:false
			if ( val === false ) {
				delete rules[ prop ];
				return;
			}
			if ( val.param || val.depends ) {
				var keepRule = true;
				switch ( typeof val.depends ) {
				case "string":
					keepRule = !!$( val.depends, element.form ).length;
					break;
				case "function":
					keepRule = val.depends.call( element, element );
					break;
				}
				if ( keepRule ) {
					rules[ prop ] = val.param !== undefined ? val.param : true;
				} else {
					$.data( element.form, "validator" ).resetElements( $( element ) );
					delete rules[ prop ];
				}
			}
		} );

		// Evaluate parameters
		$.each( rules, function( rule, parameter ) {
			rules[ rule ] = $.isFunction( parameter ) && rule !== "normalizer" ? parameter( element ) : parameter;
		} );

		// Clean number parameters
		$.each( [ "minlength", "maxlength" ], function() {
			if ( rules[ this ] ) {
				rules[ this ] = Number( rules[ this ] );
			}
		} );
		$.each( [ "rangelength", "range" ], function() {
			var parts;
			if ( rules[ this ] ) {
				if ( $.isArray( rules[ this ] ) ) {
					rules[ this ] = [ Number( rules[ this ][ 0 ] ), Number( rules[ this ][ 1 ] ) ];
				} else if ( typeof rules[ this ] === "string" ) {
					parts = rules[ this ].replace( /[\[\]]/g, "" ).split( /[\s,]+/ );
					rules[ this ] = [ Number( parts[ 0 ] ), Number( parts[ 1 ] ) ];
				}
			}
		} );

		if ( $.validator.autoCreateRanges ) {

			// Auto-create ranges
			if ( rules.min != null && rules.max != null ) {
				rules.range = [ rules.min, rules.max ];
				delete rules.min;
				delete rules.max;
			}
			if ( rules.minlength != null && rules.maxlength != null ) {
				rules.rangelength = [ rules.minlength, rules.maxlength ];
				delete rules.minlength;
				delete rules.maxlength;
			}
		}

		return rules;
	},

	// Converts a simple string to a {string: true} rule, e.g., "required" to {required:true}
	normalizeRule: function( data ) {
		if ( typeof data === "string" ) {
			var transformed = {};
			$.each( data.split( /\s/ ), function() {
				transformed[ this ] = true;
			} );
			data = transformed;
		}
		return data;
	},

	// http://jqueryvalidation.org/jQuery.validator.addMethod/
	addMethod: function( name, method, message ) {
		$.validator.methods[ name ] = method;
		$.validator.messages[ name ] = message !== undefined ? message : $.validator.messages[ name ];
		if ( method.length < 3 ) {
			$.validator.addClassRules( name, $.validator.normalizeRule( name ) );
		}
	},

	// http://jqueryvalidation.org/jQuery.validator.methods/
	methods: {

		// http://jqueryvalidation.org/required-method/
		required: function( value, element, param ) {

			// Check if dependency is met
			if ( !this.depend( param, element ) ) {
				return "dependency-mismatch";
			}
			if ( element.nodeName.toLowerCase() === "select" ) {

				// Could be an array for select-multiple or a string, both are fine this way
				var val = $( element ).val();
				return val && val.length > 0;
			}
			if ( this.checkable( element ) ) {
				return this.getLength( value, element ) > 0;
			}
			return value.length > 0;
		},

		// http://jqueryvalidation.org/email-method/
		email: function( value, element ) {

			// From https://html.spec.whatwg.org/multipage/forms.html#valid-e-mail-address
			// Retrieved 2014-01-14
			// If you have a problem with this implementation, report a bug against the above spec
			// Or use custom methods to implement your own email validation
			return this.optional( element ) || /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test( value );
		},

		// http://jqueryvalidation.org/url-method/
		url: function( value, element ) {

			// Copyright (c) 2010-2013 Diego Perini, MIT licensed
			// https://gist.github.com/dperini/729294
			// see also https://mathiasbynens.be/demo/url-regex
			// modified to allow protocol-relative URLs
			return this.optional( element ) || /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test( value );
		},

		// http://jqueryvalidation.org/date-method/
		date: function( value, element ) {
			return this.optional( element ) || !/Invalid|NaN/.test( new Date( value ).toString() );
		},

		// http://jqueryvalidation.org/dateISO-method/
		dateISO: function( value, element ) {
			return this.optional( element ) || /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/.test( value );
		},

		// http://jqueryvalidation.org/number-method/
		number: function( value, element ) {
			return this.optional( element ) || /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test( value );
		},

		// http://jqueryvalidation.org/digits-method/
		digits: function( value, element ) {
			return this.optional( element ) || /^\d+$/.test( value );
		},

		// http://jqueryvalidation.org/minlength-method/
		minlength: function( value, element, param ) {
			var length = $.isArray( value ) ? value.length : this.getLength( value, element );
			return this.optional( element ) || length >= param;
		},

		// http://jqueryvalidation.org/maxlength-method/
		maxlength: function( value, element, param ) {
			var length = $.isArray( value ) ? value.length : this.getLength( value, element );
			return this.optional( element ) || length <= param;
		},

		// http://jqueryvalidation.org/rangelength-method/
		rangelength: function( value, element, param ) {
			var length = $.isArray( value ) ? value.length : this.getLength( value, element );
			return this.optional( element ) || ( length >= param[ 0 ] && length <= param[ 1 ] );
		},

		// http://jqueryvalidation.org/min-method/
		min: function( value, element, param ) {
			return this.optional( element ) || value >= param;
		},

		// http://jqueryvalidation.org/max-method/
		max: function( value, element, param ) {
			return this.optional( element ) || value <= param;
		},

		// http://jqueryvalidation.org/range-method/
		range: function( value, element, param ) {
			return this.optional( element ) || ( value >= param[ 0 ] && value <= param[ 1 ] );
		},

		// http://jqueryvalidation.org/step-method/
		step: function( value, element, param ) {
			var type = $( element ).attr( "type" ),
				errorMessage = "Step attribute on input type " + type + " is not supported.",
				supportedTypes = [ "text", "number", "range" ],
				re = new RegExp( "\\b" + type + "\\b" ),
				notSupported = type && !re.test( supportedTypes.join() );

			// Works only for text, number and range input types
			// TODO find a way to support input types date, datetime, datetime-local, month, time and week
			if ( notSupported ) {
				throw new Error( errorMessage );
			}
			return this.optional( element ) || ( value % param === 0 );
		},

		// http://jqueryvalidation.org/equalTo-method/
		equalTo: function( value, element, param ) {

			// Bind to the blur event of the target in order to revalidate whenever the target field is updated
			var target = $( param );
			if ( this.settings.onfocusout && target.not( ".validate-equalTo-blur" ).length ) {
				target.addClass( "validate-equalTo-blur" ).on( "blur.validate-equalTo", function() {
					$( element ).valid();
				} );
			}
			return value === target.val();
		},

		// http://jqueryvalidation.org/remote-method/
		remote: function( value, element, param, method ) {
			if ( this.optional( element ) ) {
				return "dependency-mismatch";
			}

			method = typeof method === "string" && method || "remote";

			var previous = this.previousValue( element, method ),
				validator, data, optionDataString;

			if ( !this.settings.messages[ element.name ] ) {
				this.settings.messages[ element.name ] = {};
			}
			previous.originalMessage = previous.originalMessage || this.settings.messages[ element.name ][ method ];
			this.settings.messages[ element.name ][ method ] = previous.message;

			param = typeof param === "string" && { url: param } || param;
			optionDataString = $.param( $.extend( { data: value }, param.data ) );
			if ( previous.old === optionDataString ) {
				return previous.valid;
			}

			previous.old = optionDataString;
			validator = this;
			this.startRequest( element );
			data = {};
			data[ element.name ] = value;
			$.ajax( $.extend( true, {
				mode: "abort",
				port: "validate" + element.name,
				dataType: "json",
				data: data,
				context: validator.currentForm,
				success: function( response ) {
					var valid = response === true || response === "true",
						errors, message, submitted;

					validator.settings.messages[ element.name ][ method ] = previous.originalMessage;
					if ( valid ) {
						submitted = validator.formSubmitted;
						validator.resetInternals();
						validator.toHide = validator.errorsFor( element );
						validator.formSubmitted = submitted;
						validator.successList.push( element );
						validator.invalid[ element.name ] = false;
						validator.showErrors();
					} else {
						errors = {};
						message = response || validator.defaultMessage( element, { method: method, parameters: value } );
						errors[ element.name ] = previous.message = message;
						validator.invalid[ element.name ] = true;
						validator.showErrors( errors );
					}
					previous.valid = valid;
					validator.stopRequest( element, valid );
				}
			}, param ) );
			return "pending";
		}
	}

} );

// Ajax mode: abort
// usage: $.ajax({ mode: "abort"[, port: "uniqueport"]});
// if mode:"abort" is used, the previous request on that port (port can be undefined) is aborted via XMLHttpRequest.abort()

var pendingRequests = {},
	ajax;

// Use a prefilter if available (1.5+)
if ( $.ajaxPrefilter ) {
	$.ajaxPrefilter( function( settings, _, xhr ) {
		var port = settings.port;
		if ( settings.mode === "abort" ) {
			if ( pendingRequests[ port ] ) {
				pendingRequests[ port ].abort();
			}
			pendingRequests[ port ] = xhr;
		}
	} );
} else {

	// Proxy ajax
	ajax = $.ajax;
	$.ajax = function( settings ) {
		var mode = ( "mode" in settings ? settings : $.ajaxSettings ).mode,
			port = ( "port" in settings ? settings : $.ajaxSettings ).port;
		if ( mode === "abort" ) {
			if ( pendingRequests[ port ] ) {
				pendingRequests[ port ].abort();
			}
			pendingRequests[ port ] = ajax.apply( this, arguments );
			return pendingRequests[ port ];
		}
		return ajax.apply( this, arguments );
	};
}

}));
(function( factory ) {
	if ( typeof define === "function" && define.amd ) {
		define( ["jquery", "../jquery.validate"], factory );
	} else if (typeof module === "object" && module.exports) {
		module.exports = factory( require( "jquery" ) );
	} else {
		factory( jQuery );
	}
}(function( $ ) {

/*
 * Translated default messages for the jQuery validation plugin.
 * Locale: ZH (Chinese, 中文 (Zhōngwén), 汉语, 漢語)
 */
$.extend( $.validator.messages, {
	required: "这是必填字段",
	remote: "请修正此字段",
	email: "请输入有效的电子邮件地址",
	url: "请输入有效的网址",
	date: "请输入有效的日期",
	dateISO: "请输入有效的日期 (YYYY-MM-DD)",
	number: "请输入有效的数字",
	digits: "只能输入数字",
	creditcard: "请输入有效的信用卡号码",
	equalTo: "你的输入不相同",
	extension: "请输入有效的后缀",
	maxlength: $.validator.format( "最多可以输入 {0} 个字符" ),
	minlength: $.validator.format( "最少要输入 {0} 个字符" ),
	rangelength: $.validator.format( "请输入长度在 {0} 到 {1} 之间的字符串" ),
	range: $.validator.format( "请输入范围在 {0} 到 {1} 之间的数值" ),
	max: $.validator.format( "请输入不大于 {0} 的数值" ),
	min: $.validator.format( "请输入不小于 {0} 的数值" )
} );

}));
//vue日历
Vue.component('calendar', {
    template: '<div class="calendar-custom">' +
    '            <div class="calendar-head">' +
    '                <p class="date">' +
    '                    <a href="javascript:void(0);" class="btn-left" v-on:click="monthCut">' +
    '                        <i class="icon-angle-left"></i>' +
    '                    </a>' +
    '                    <a href="javascript:void(0);" class="btn-right" v-on:click="monthAdd">' +
    '                        <i class="icon-angle-right"></i>' +
    '                    </a>' +
    '                    <span><b>{{year}}</b>年<b>{{month+1}}</b>月</span>' +
    '                </p>' +
    '            </div>' +
    '            <p class="week clearfix">' +
    '                <span>周一</span>' +
    '                <span>周二</span>' +
    '                <span>周三</span>' +
    '                <span>周四</span>' +
    '                <span>周五</span>' +
    '                <span>周六</span>' +
    '                <span>周日</span>' +
    '            </p>' +
    '            <div class="days-con">' +
        '            <ul class="days clearfix">' +
        '                <li v-for="item in days.prev" class="none" track-by="$index">' +
        '                    <b>{{item}}</b>' +
        '                    <span "></span>' +
        '                </li>' +
        '                <li v-for="item in days.now" :class="{\'none\': year == yearNow && month == monthNow &&  item > dayNow }" v-on:click="click(item)" track-by="$index">' +
        '                    <b>{{item}}</b>' +
        '                    <span :class="{\'green\':  statuPre[item-1] == 1,\'red\':  statuPre[item-1] == 2,\'empty\':  statuPre[item-1] == 3 }"></span>' +
    
        '                </li>' +
        '                <li v-for="item in days.next" class="none" track-by="$index">' +
        '                    <b>{{item}}</b>' +
        '                    <span"></span>' +
        '                </li>' +
        '            </ul>' +
    '            </div>' +
                '<template v-if="url">'+
        '            <p class="statis">' +
        '                <span class="status green"></span>' +
        '                正常出勤<b>{{fattnCount}}</b>天&nbsp;' +
        '                <span class="status red"></span>' +
        '                迟到<b>{{flateCount}}</b>次&nbsp;' +
        '                <span class="status red"></span>' +
        '                早退<b>{{fleaveCount}}</b>次&nbsp;' +
        '                <span class="status red"></span>' +
        '                旷工<b>{{fabsenceCount}}</b>次' +
        '            </p>' +
                '</template>'+
    
    '        </div>',
    props: ['clickFun','url','monthChangeFun','clearFun'],
    data: function () {
        return {
            days: [],//某个月份的日期视图
            statuPre: [],//每天签到状态
            fabsenceCount: '', //旷工天数
            fattnCount: '',//出勤天数
            flateCount:'', //迟到次数
            fleaveCount: '',//早退次数
            year: '',
            month: '', //0-11
            day: '',
            week:'',
            yearNow: '',
            monthNow: '',
            dayNow: '',
            weekNow:'',
            firstDayWeek:'',
            late: '',
            leaveEarly: '',
            workNone: '',
            active:'',
            fpersonId:'',
            numCount: 1
        }
    },
    ready: function () {
        var self = this;
        // this.req();
        this.year = this.yearNow =this.today().year;
        this.month = this.monthNow = this.today().month;
        this.day = this.dayNow = this.today().day;
        this.week = this.weekNow = this.today().week;
        var day = this.dayNow;
        var week = this.weekNow;
        var firstDayWeek = this.weekNow; //1号是周几
        var firstWeekDay = this.dayNow - parseInt(this.dayNow / 7) * 7  ; //第一个星期的今天对应的日期
        if(firstWeekDay==0)
        {
            firstWeekDay = 7;
        }
        for (var i = firstWeekDay; i > 1; i--) {
            //得到1号是周几
            week--;
            if (week < 0) {
                week = 6;
            }
        }
        // for (var i = 1; i < firstWeekDay; i++) {
        //     //得到1号是周几
        //     firstDayWeek--;
        //     if (firstDayWeek < 1) {
        //         firstDayWeek = 7;
        //     }
        // }
        this.firstDayWeek = week;
        this.days = this.monthView(this.year,this.month);
        this.chose(this.dayNow);
    },
    methods: {
        clear: function(){
            if(this.active)
            {
                this.active.className = '';
                this.active = null;
            }
            this.clearFun&&this.clearFun();
        },
        req: function (datas) {  //datas: fmonth,fpersonId
            // debugger
            // if(!this.url) return
            if(datas&&datas.fpersonId) //从外部请求的时候需要处理用于显示year month格式，不需要处理data格式
            {
                this.fpersonId = datas.fpersonId;
                this.year = datas.month.split('-')[0];
                this.month = parseInt(datas.month.split('-')[1])-1;
                this.days = this.monthView(this.year,this.month)
            } 
            else{
                //从内部请求不需要处理year month格式但是需要处理datas
               var datas = {
                   month: this.year +'-' + (((this.month+1)<10&&('0'+(this.month+1)))||(this.month+1)),
                   fpersonId: this.fpersonId
               } 
               this.days=this.monthView(this.year,this.month)
            }
            if(this.url){
                this.numCount++;
                var numCount = this.numCount;
                var self = this;
                $.ajax({
                    url: self.url,
                    type: "GET",
                    cache: false,
                    dataType: 'JSON',
                    data: datas,
                    success: function (data) {
                        if(self.numCount == numCount)
                        {
                            // self.statuPre = data;
                            self.statuPre = self.statusCalc(data.attnList);
                            self.fabsenceCount=data.fabsenceCount;
                            self.flateCount=data.flateCount;
                            self.fleaveCount=data.fleaveCount;
                            self.fattnCount=data.fattnCount;
                        }
                    }
                });
            }
            
        },
        today: function () {  
            var dates = new Date();
            var years = dates.getFullYear();
            var months = dates.getMonth();
            var days = dates.getDate();
            var weeks = dates.getDay(); //今天周几
            return {
                year: years,
                month: months,
                day: days,
                week: weeks
            }
        },
        click: function (text) {
            
            var et = event.target.tagName == "LI" && event.target || event.target.parentNode;
            if(et.className!='none')
            {
                this.day = text;
                var date = this.year+'-'+((this.month+1)<10&&('0'+(this.month+1))||(this.month+1))+'-'+(text<10&&('0'+text)||text);
                this.clickFun(date,this.fpersonId);
                if(this.active)
                {
                    this.active.className = '';
                }
                this.active = et;
                
                et.className = 'active';
            }        
        },
        chose: function (day) {  

        },
        statusCg: function (text) {
            return text == 1 && 'green' || text == 2 && 'red' || text == 3 && 'empty' 
        },
        statusCalc: function (data) {
            if(data)
            {
                var status = [];
                var allStatus = data;
                for(var i=0;i< allStatus.length;i++)
                {
                status [parseInt(allStatus[i].fdate.split('-')[2])-1] = allStatus[i].status;
                }
                return status
            }  
        },
        monthCut: function () {
            if (this.month > 0) {
                this.month--;
            }
            else {
                this.month = 11;
                this.year --;
            }
            this.days = this.monthView(this.year,this.month);
            if(this.active)
            {
                this.active.className = '';
            }
            this.statuPre = {};
            this.monthChangeFun&&this.monthChangeFun();
            this.req();

        },
        monthAdd: function () {
            if(this.year == this.yearNow&&this.month < this.monthNow||this.year < this.yearNow)
            {
                if (this.month < 11) {
                    this.month++;
                }
                else {
                    this.month = 0;
                    this.year ++;
                }
                this.days = this.monthView(this.year,this.month);
                if(this.active)
                {
                    this.active.className = '';
                }
                this.statuPre = {};
                this.monthChangeFun&&this.monthChangeFun();
                this.req();
            }
            else {
                return false
            }
            
            
        },
        //计算月视图
        monthView: function (year,month){
            this.statuPre =[];
            var dayDisplay = {
                prev: [],
                now: [],
                next:[]
            }; //显示出来的日期数组
            var daysAll = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            if (parseInt(this.yearNow / 4) * 4 == this.yearNow) {
                daysAll[1] = 29;
            }
            var yearGap = this.yearNow - year;
            var length = yearGap * 12 + this.monthNow - month; //差多少个月
            var daysGap = 0,monthCount = this.monthNow,yearCount = this.yearNow; 
            
                
            for(var i = 0; i<length;i++ )
            {
                monthCount --;
                if(monthCount<0)
                {
                    monthCount = 11;
                    yearCount--;
                    if (parseInt(yearCount / 4) * 4 != yearCount) {
                        daysAll[1] = 28;
                    }
                    else{
                        daysAll[1] = 29;
                    }
                }
                daysGap = daysGap + daysAll[monthCount];
            }
            var firstWeekDay = daysGap-parseInt(daysGap/7)*7 + 1; //+1是因为本月1号
            if(firstWeekDay==0)
            {
                firstWeekDay = 7;
            }
            var firstDayWeek = this.firstDayWeek;
            if(year!=this.yearNow||year == this.year&&month!=this.monthNow)
            {
                for (var d = firstWeekDay; d > 1; d--) {
                //得到1号是周几
                    firstDayWeek--;
                    if (firstDayWeek < 0) {
                        firstDayWeek = 6;
                    }
                }
            }

            // if (parseInt(year / 4) * 4 == year) {
            //     daysAll[1] = 29;
            // }
            
            // debugger
            var month2 = month - 1;
            var year2 = year;
            if(month2 <0)
            {
                month2 = 11;
            }
            for (var m = 1 ; m < firstDayWeek; m++) {
                dayDisplay.prev.push(daysAll[month2]-firstDayWeek+m);
            }
            for (var n = 1; n <= daysAll[month]; n++) {
                dayDisplay.now.push(n);
            }
            for(var next = 1 ; next <= (42-dayDisplay.now.length-dayDisplay.prev.length);next++){
                dayDisplay.next.push(next);
            }
            // this.days=[];
            return dayDisplay;

            // console.log(this.days)
            // return dayDisplay
        },
        
    },
    computed: {
        late: function () {
            return 3
        },
        leaveEarly: function () {
            return 3
        },
        workNone: function () {
            return 3
        }
    },
    events: {
        'form-panel': function (msg) {
            if (msg == 'close') {
                this.$el.style.right = '-390px';
            }
        }
    }
});
//缓存当前url
if (!document.getElementById('iframe-ct')) {
    sessionStorage.ifUrl = location.href;
}
//设置日期组件的语言
$.datetimepicker.setLocale('ch');
//表单替换非法字符
function htmlEncode(value){
    return !value ? value : String(value).replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}


//监听键盘
var common = {};
//已弃用
common.ajax = function (url, reqType, dataType, paramData, async, beforeFuncion, callback) {
    $.ajax({
        url: url,
        type: reqType,
        dataType: dataType,
        data: paramData,
        async: async,
        beforeSend: beforeFuncion,
        success: callback,
        error: function (data) {
            warnFull(jQuery.parseJSON(data.responseText).message);
        }
    });
};
//  common.ajax(self.urlReq,'GET','JSON',{"fcode":self.infoType},true,null,function(data){self.option = data;})
(function ($) {
    //备份jquery的ajax方法
    var _ajax = $.ajax;

    //重写jquery的ajax方法
    $.ajax = function (opt) {
        //备份opt中error和success方法
        var fn = {
            error:function(XMLHttpRequest, textStatus, errorThrown){},
        }
        if(opt.error){
            fn.error=opt.error;
        }

        //扩展增强处理
        var _opt = $.extend(opt, {
            error: function (data,XMLHttpRequest, textStatus, errorThrown) { 
                //错误方法增强处理
                warnFull(jQuery.parseJSON(data.responseText).message,'red');
                fn.error(XMLHttpRequest, textStatus, errorThrown); 
            }
        });
        _ajax(_opt);
    };
})(jQuery);
//组件
//全屏警告
function warnFullFun() {
    var temCon = document.createElement("div");
    temCon.id = 'opera-warn';
    temCon.className = "opera-warn";
    temCon.style.display = 'none';
    temCon.innerHTML = "<div class='warn-box'><p class='warn-text'></p><p class='warn-btncon'><a href='javascript:;' class='warn-cancel'>否</a><a href='javascript:;' class='warn-confirm'>是</a></p></div>";
    document.body.appendChild(temCon);
    var warnYes, warnNo;
    var $opera = document.getElementById('opera-warn');
    var $operaText = $opera.getElementsByClassName('warn-text')[0];
    var $operaBox = $opera.getElementsByClassName('warn-box')[0];
    var $operaYes = $opera.getElementsByClassName('warn-confirm')[0];
    var $operaNo = $opera.getElementsByClassName('warn-cancel')[0];
    var warn = function (text, color, callback1, callback2) {
        var rmet = function () {
            $opera.style.display = 'none';
            $operaYes.removeEventListener('click', warnYes, false);
            $operaNo.removeEventListener('click', warnNo, false);
        }
        rmet();
        $operaBox.className = (color == 'blue' || !color) && 'warn-box' || color == 'yellow' && 'warn-box warn-box-yellow' || color == 'green' && 'warn-box warn-box-green' || color == 'red' && 'warn-box warn-box-red';
        $operaText.innerHTML = text;
        $operaNo.style.display = "inline-block";
        if (typeof callback2 != "function") {
            $operaNo.style.display = 'none';
        }
        $opera.style.display = 'block';
        var warnYes = function (e) {
            callback1 && callback1();
            rmet();
        };
        var warnNo = function (e) {
            callback2 && callback2();
            rmet();
        }
        $operaYes.addEventListener('click', warnYes, false);
        $operaNo.addEventListener('click', warnNo, false);
        
    };
    return warn
};
//顶部警告
function warnTopFun() {
    var temCon = document.createElement('div');
    temCon.id = "opera-warn-top";
    temCon.className = "opera-warn-top";
    temCon.style.display = 'none';
    temCon.innerHTML = "<p class='warn-top'><span class='warn-text'></span><a href='javascript:;' class='warn-confirm'>确认</a><a href='javascript:;' class='warn-cancel'>取消</a></p>";
    document.body.appendChild(temCon);
    var warnYes, warnNo;
    var $opera = document.getElementById('opera-warn-top');
    var $operaTop = $opera.getElementsByClassName('warn-top')[0];
    var $operaText = $opera.getElementsByClassName('warn-text')[0];
    var $operaYes = $opera.getElementsByClassName('warn-confirm')[0];
    var $operaNo = $opera.getElementsByClassName('warn-cancel')[0];
    var warn = function (text, color, callback1, callback2) {
        var time;
        
        $operaYes.removeEventListener('click', warnYes, false);
        $operaNo.removeEventListener('click', warnNo, false);
        $operaTop.className = (color == 'blue' || !color) && 'warn-top' || color == 'yellow' && 'warn-top warn-top-yellow' || color == 'green' && 'warn-top warn-top-green' || color == 'red' && 'warn-top warn-top-red';
        $operaText.innerHTML = text;
        $operaNo.style.display = 'inline-block';
        if (typeof callback2 != "function") {
            $operaNo.style.display = 'none';
        }
        $opera.style.display = 'block';
        var rmet = function () {
            $opera.style.display = 'none';
            $operaYes.removeEventListener('click', warnYes, false);
            $operaNo.removeEventListener('click', warnNo, false);
        }
        var warnYes = function (e) {
            callback1 && callback1();
            clearTimeout(time)
            rmet();
        };
        var warnNo = function (e) {
            callback2 && callback2();
            rmet();
        }
        if(!callback2)
        {
            time = setTimeout(function(){
                $opera.style.display = 'none';
            },2000)
        }
        $operaYes.addEventListener('click', warnYes, false);
        $operaNo.addEventListener('click', warnNo, false);
    };
    return warn
};

//全屏警告warnFull('警告内容'，'颜色blue red yellow green'，点击‘是’执行的函数，点击‘否’执行的函数)
//顶部警告warnTop('警告内容'，'颜色blue red yellow green'，点击‘是’执行的函数，点击’否‘执行的函数)
var warnFull = warnFullFun(), warnTop = warnTopFun();

//按钮锁定
(function () {
    $('body').on('click', '.lock-con .icon-lock', function () {
        $(this).removeClass('icon-lock').addClass('icon-unlock');
        $(this).siblings('.btn').removeClass('btn-disabled').addClass('btn-stand').removeAttr('disabled');
    })
    $('body').on('click', '.lock-con .icon-unlock', function () {
        $(this).removeClass('icon-unlock').addClass('icon-lock');
        $(this).siblings('.btn').removeClass('btn-stand').addClass('btn-disabled').attr('disabled', '');
    })
} ());

//重要事项输入框
(function () {
    $('body').on('focus', '.import-input',function (e){
        var magnifyInput = $(this).parent().find('.magnify-input');
        if (magnifyInput.length===0) {
            var top = $(this).position().top - 30;
            var itit = $("<p class='magnify-input' style='top:" + top + "px'></p>");
            $(this).after(itit);
        }
        magnifyInput.css('display', 'block');
    });
    $('body').on('blur', '.import-input',function (e){
        $(this).parent().find('.magnify-input').css('display', 'none');
    });
    $('body').on('keyup', '.import-input',function (e){
        
            var value = $(this).val();
            var newValue = [];
            var space = $(this).attr('space');
            if(!space)
            {
                space = 4;
            }
            for (var i = 0; i < value.length / space; i++) {
                newValue[i] = value.substring(space * i, space * (i + 1))
            }
            
            $(this).parent().find('.magnify-input').html(newValue.join(' '));

        
    });
    $('body').on('keydown', '.import-input',function (e){
            if ($(this).attr('maxlength')&&$(this).val().length > $(this).attr('maxlength') && e.keyCode >= 48 && e.keyCode <= 57) { return false }
    });
} ());
// ztree滚动
var scrollZtree = function (con, scr) {
    //参数：按钮的容器，滚动的容器
    function exe() {
        //scroll
        var time,//滚动定时
            time2,//scrolling延迟定时
            lengths = 5;//滚动基数
        zt = 1,//开始滚动
            btncon = $('#' + con),//按钮容器
            slt = $('#' + con + ' .slt'),
            slb = $('#' + con + ' .slb'),
            slbtn = $('#' + con + ' .scrollbtn'),
            slcon = $('#' + scr),//滚动的容器
            slmain = slcon.children().eq(0);//滚动的主体
        //向上滚动
        slt.mousedown(function () {
            var sltp;
            time = setInterval(function () {
                sltp = slcon.prop('scrollTop') - lengths;
                if (sltp > 0) {
                    slcon.prop('scrollTop', sltp);
                }
                else {
                    slcon.prop('scrollTop', 0);
                    slt.css('display', 'none');
                }
            }, 20)
        })
        //向下滚动
        slb.mousedown(function () {
            var sltp;
            time = setInterval(function () {
                sltp = slcon.prop('scrollTop') + lengths;
                slcon.prop('scrollTop', sltp);
                if (slcon.prop('scrollTop') == sltp - lengths) {
                    slb.css('display', 'none');
                }
            }, 20)
        })

        //清除定时
        slt.mouseup(function () {
            clearInterval(time);
        })
        slt.mouseout(function () {
            clearInterval(time);
        })
        slb.mouseup(function () {
            clearInterval(time);
        })
        slb.mouseout(function () {
            clearInterval(time);
        })
        //滚动监听
        slcon.scroll(function () {
            zt && slbtn.css('display', 'block');
            clearTimeout(time2)
            time2 = setTimeout(function () {
                over();
            }, 100)
            zt = 0;


        })
        function over() {
            if (slcon.prop('scrollTop') == 0) {
                slt.css('display', 'none');
            }
            else if (slcon.prop('scrollTop') >= slmain.height() - slcon.height()) {
                slb.css('display', 'none');
            }
            zt = 1;
        }
        // 窗口尺寸
        var sizecg = function () {
            if (slmain.height() <= slcon.height()) {
                slbtn.css('display', 'none')
            }
            else {
                if (slcon.prop('scrollTop') == 0) {
                    slb.css('display', 'block')
                }
                else {
                    slbtn.css('display', 'block')
                }

            }
        }
        $(window).resize(function () {
            sizecg();
        })
        btncon.load(function () {
            sizecg();
            slt.css('display', 'none')
        })
        btncon.click(function () {
            setTimeout(function () {
                sizecg();
            }, 400)
        })
    }
    return exe();
}


Vue.component('fold-list',{
    template: '<div class="fold-list">'+
        '            <p class="fold-list-head">'+
        '                <span></span>'+
        '                <span v-for="item in head" >{{item.name}}</span>'+
        '                <span>操作</span>'+
        '            </p>'+
        '            <div class="fold-list-main scroll-stand">'+
        '                <ul v-bind:class="{\'role-open\':item.childrenList}" v-for="item in list" order={{$index}} >'+
        '                    <fold-list-main :item="item" :head="head" :opera="opera" :mark="mark" :top-delete="topDelete"></fold-list-main>'+
        '                </ul>'+
        '            </div>'+
                    
                    '<div class="loding-con" style="display:none">'+
                        '<p class="loding"><span></span><span></span><span></span><span></span><span></span><span></span></p>'+
                    '</div>'+
        '        </div>',
    props: ['url','head','must','opera','itemClick','viewFun','mark','topDelete'],
    data: function(){
        return {
            list:'',
            fid: '',
            numCount: true,
            lastActiveLi: ''
        }
    },
    ready: function(){
        var self=this;
        if(self.url)
        {
            self.$el.querySelector('.loding-con').style.display='block';
            $.ajax({
                url : self.url,
                type : "GET",
                dataType :"JSON",
                success : function(data){
                    self.list=data;
                    self.$el.querySelector('.loding-con').style.display='none';
                },
                error:function () { 
                    if(self.$el.querySelector('.loding-con'))
                    {
                        self.$el.querySelector('.loding-con').style.display='none';
                    }
                 }
            });
        }
        
        //监听所有click事件
        this.$el.addEventListener('click',function(e){
            var fids;
            var targetData;
            if(e.target.tagName=='A')
            {
                fids = e.target.parentNode.parentNode.getAttribute('fid');
                self.fid=fids;
                targetData = self.searchData(self.list,fids);
                if(e.target.innerHTML=='查看')
                {
                    self.viewFun(targetData);
                }
                else
                {
                    for(var i=0;i<self.opera.length;i++)
                    {
                        if(e.target.innerHTML==self.opera[i].name)
                        {
                            self.opera[i].operaFun(targetData);
                        }
                    }

                }
                self.active(e);
                
                
            }
            else if(e.target.tagName=='SPAN'&&e.target != e.target.parentNode.getElementsByTagName('span')[0])
            {
                fids = e.target.parentNode.getAttribute('fid');
                self.fid = fids;
                targetData = self.searchData(self.list,fids);
                if(e.target.parentNode.tagName == 'LI')
                {
                    //点击本栏
                    self.itemClick&&self.itemClick(targetData);
                }
                self.active(e);
            };
            
            

        },false)
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
        active: function(e){
            var li = this.findParent(e.target,'LI');
            if(self.lastActiveLi)
            {
                self.lastActiveLi.className = '';
            }

            li.className = 'active';
            self.lastActiveLi = li;
        },
        setData: function(listData, numCount2){
                this.list = listData;
                this.$el.querySelector('.loding-con').style.display = 'none';

        },
        searchData: function(datas,fids) {
            var success = false,target = null;
            var deep = 0;
            var circu;
            if(!this.mark)
            {
                circu = function(dataSin,fidCp){
                    deep ++;
                    if(deep<10){ 
                        for (var i = 0;i < dataSin.length;i++)
                        {
                            if(fidCp == dataSin[i].fid){
                                over = dataSin[i] ;
                                success = true;
                                target = dataSin[i];
                                return
                            }
                            else if( dataSin[i].childrenList.length>0){
                                // path[deep] = i;
                                circu(dataSin[i].childrenList,fidCp);
                            }
                            if(success)  return 
                        }
                    }
                    deep --;
                };
            }
            else
            {
                circu = function(dataSin,fidCp){
                    deep ++;
                    if(deep<10){ 
                        for (var i = 0;i < dataSin.length;i++)
                        {
                            if(fidCp == dataSin[i][this.mark]){
                                over = dataSin[i] ;
                                success = true;
                                target = dataSin[i];
                                return
                            }
                            else if( dataSin[i].childrenList.length>0){
                                // path[deep] = i;
                                circu(dataSin[i].childrenList,fidCp);
                            }
                            if(success)  return 
                        }
                    }
                    deep --;
                };

            }
            circu(datas,fids);
            return target;
        },
        refresh: function(){
            var self=this;
            if(self.url)
            {
                $.ajax({
                    url : self.url,
                    type : "GET",
                    dataType :"JSON",
                    success : function(data){
                        self.list=data;
                    }
                });
            }
        }
    }
    
});
Vue.component('fold-list-main', {
    template: '<li fid={{item.fid}}>'+
'            <span v-on:click.stop="switch">'+
'                <a href="javascript:;" class="switchul" v-on:click.stop="switch"><i class="icon-angle-right"></i></a>'+
'            </span>'+
            '<template v-for="headItem in head">'+
                '<template v-if="typeof headItem.getter == \'undefined\'">'+ 
                    '<span>{{item[headItem.field]}}</span>'+
                '</template>'+
                '<template v-else>'+ 
                    '<span>{{headItem.getter(item[headItem.field])}}</span>'+
                '</template>'+
            '</template>'+
'            <span fid="{{item.fid}}">'+
                '<a href="javascript:;">查看</a>'+
                '<template v-if="topDelete">'+
                    '<template v-for="item2 in opera">'+
                        '<i class="vertical"></i>'+
                        '<a href="javascript:;" >{{item2.name}}</a>'+
                    '</template>'+
                '</template>'+
                
'            </span>'+
'        </li>'+
'        <li v-for="item2 in item.childrenList"  fid={{item2.fid}}>'+
'            <template v-if="item2.childrenList.length>0">'+
'                <ul v-bind:class="{\'role-open\':true}" order={{$index}}>'+
'                    <fold-list-main :item="item2" :head="head" :opera="opera" :mark="mark" :top-delete="true"></fold-list-main>'+
'                </ul>'+
'            </template>'+
'            <template v-else>'+
'                <span>'+
'                </span>'+
'                <span v-for="headItem in head">{{item2[headItem.field]}}</span>'+
'                <span>'+
                    '<a href="javascript:;">查看</a>'+
                    '<template v-for="item2 in opera">'+
                        '<i class="vertical"></i>'+
                        '<a href="javascript:;" >{{item2.name}}</a>'+
                    '</template>'+
'                </span>'+
'            </template>'+
'        </li>',
    //数据和左填充
    props: ['item','head','opera','mark','topDelete'],
    data: function(){
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
});
Vue.component('form-panel',{
    template: '<div class="content-right">'+
                '<div class="class-cr clearfix">'+
                    '<a class="item-btn hover">'+
                        '<i class="icon-pencil"></i>'+
                        '<span class="operName1">{{opeType==\'add\'&&\'新增\'||opeType==\'edit\'&&\'编辑\'||opeType==\'view\'&&\'查看\'||\' \'}}</span>'+
                    '</a>'+
                    '<p class="item-list2">'+
                        '<a href="javascript:;" class="item-btn item-btn1" v-on:click="saveMess()" v-show="opeType!=\'view\'"><i class=" icon-ok"></i></a>'+
                        '<a href="javascript:;" class="item-btn item-btn2" v-on:click="close()"><i class=" icon-remove"></i></a>'+
                    '</p>'+
                '</div>'+
                '<div class="content-con">'+
                    '<div class="title-list-fold">'+
                        '<template v-if="form.title">'+
                            '<p class="title-switch">'+
                                '<span>{{form.title}}</span>'+
                            '</p>'+
                        '</template>'+
                        '<template v-for="item in form.data">'+
                            '<template v-if="!item.select">'+
                                '<div class="form-group">'+
                                    '<label>{{item.name}}</label>'+
                                    '<input type="text" class="form-control" v-model="formData[item.field]" data-val="formData[item.dataField]" required v-bind:readonly="item.readonly==true&&readAdd||readonly" v-on:click="item.operaFun&&inputOpera(item.operaFun)">'+
                                '</div>'+
                            '</template>'+
                            '<template v-else>'+
                                '<div class="form-group">'+
                                    '<label>{{item.name}}</label>'+
                                    '<select-stand :info-type="item.select.infoTypes" :type="item.select.types" :readonly="readonly" :auto-chose="item.field" :localdata="item.select.localdata" :url="item.select.url" :after-chose="item.select.afterChose" :before-chose="item.select.beforeChose" :custom-field="item.select.customField" :spread-event="item.select.spreadEvent" :paras="item.select.paras" :link-field="item.select.linkField">'+
                                    '</select-stand>'+
                                '</div>'+
                            '</template>'+
                        '</template>'+
                        '<template v-if="statusForm.title">'+
                            '<p class="title-switch">'+
                                '<span>{{statusForm.title}}</span>'+
                            '</p>'+
                        '</template>'+
                        '<template v-for="item in statusForm.data">'+
                            '<div class="form-group">'+
                                '<label>{{item.name}}</label>'+
                                '<input type="text" class="form-control" v-model="formData[item.field]" required v-bind:readonly= \'true\' >'+
                            '</div>'+
                        '</template>'+
                        '<template v-if="passWordOpera.title">'+
                            '<p class="title-switch" href="javascript:;">'+
                                '<span>{{passWordOpera.title}}</span>'+
                            '</p>'+
                        '</template>'+
                        '<template v-for="item in passWordOpera.data">'+
                            '<p class="lock-con">'+
                                '<i class="icon-lock"></i>'+
                                '<button v-on:click="item.operaFun()" class="btn btn-disabled" disabled>{{item.name}}</button>'+
                            '</p>'+
                        '</template>'+
                    '</div>'+
                    '<div class="loding-con" style="display:none">'+
                        '<p class="loding"><span></span><span></span><span></span><span></span><span></span><span></span></p>'+
                    '</div>'+
                '</div>'+
              '</div>',
    props: ['saveUrl','reqUrl','form','statusForm','passWordOpera','refresh','saveFun','openFun','closeFun','afterSaveFun'],
    data: function(){
        return {
            opeType: '', //操作类型,add,view,edit
            opeFid: '', //被操作fid
            num: 0,
            statu: '', //开关状态
            formData:'',
            selectGroup: [],
            
        }
        
    },
    ready: function(){
        var form=this.form.data;
        for(var i=0;i<form.length;i++)
        {
            if(form[i].select)
            {
                this.selectGroup.push(i)
            }
        }

    },
    methods: {
        open: function(type) {
            this.$el.style.right = '0px';
            this.opeType = type;
            this.statu = 'open';
            if(type == 'add')
            {
                this.$broadcast('formAdd');
            }
            this.openFun&&this.openFun();
        },
        close: function() {
            this.$el.style.right = '-390px';
            this.$parent.$broadcast('form-panel', 'close');    this.statu = 'close';      
            this.opeType = '';
            this.opeFid = '';
            this.closeFun&&this.closeFun();
        },
        req: function(fidpre,type) {
            this.num++;
            var num2 = this.num;
            var self = this;
            this.$el.getElementsByClassName('loding-con')[0].style.display = 'block';
            this.open(type);
            //请求数据资料
            $.ajax({
                url: self.reqUrl,
                type: "GET",
                cache: false,
                dataType: 'JSON',
                data: {"fid": fidpre},
                success: function (data) {
                    if (num2 == self.num) {
                        self.formData = data;
                        self.opeFid = fidpre;
                        self.$broadcast('formDataReady',data);
                        self.$el.getElementsByClassName('loding-con')[0].style.display = 'none';
                        //访问select
                        // for(var i=0;i<self.selectGroup.length;i++)
                        // {
                        //     self.$children[i].choseSome(data[self.form.data[self.selectGroup[i]].field])
                        // }
                        // selectStatu.$refs.select1.choseSome(self.items.fcodeType)
                    }
                },
                error:function () { 
                    if(self.$el.querySelector('.loding-con'))
                    {
                        self.$el.querySelector('.loding-con').style.display='none';
                    }
                 }
            });
        },
        saveMess: function() {
            var self = this;
            //获取子组件的值
            for(var i=0;i<self.selectGroup.length;i++)
            {
                this.formData[this.form.data[this.selectGroup[i]].field] = self.$children[i].val();
            }
            if(!this.saveFun)
            {
                
                if (this.opeType == 'add' || this.opeType == 'edit') {
                    //todo验证
                    $.ajax({
                        url: self.saveUrl,
                        type: "GET",
                        cache: false,
                        dataType: 'JSON',
                        data: self.formData,
                        success: function (data) {
                            self.close();
                            warnTop('保存成功！');
                            self.afterSaveFun&&self.afterSaveFun();
                            // self.refresh();
                            // content.$refs.table1.pgChange(1);
                        },
                        error:function () { 
                            if(self.$el.querySelector('.loding-con'))
                            {
                                self.$el.querySelector('.loding-con').style.display='none';
                            }
                        }
                    });
                } else {
                    self.close();
                }
            }
            else{
                this.saveFun();
                this.afterSaveFun&&this.afterSaveFun();
            }
            

        },
        //如果只读，操作函数失效
        inputOpera: function(fun){
            if(!this.readonly)
            {
                fun();
            }
        }

    },
    computed:{
        readonly: function (){
            return this.opeType=='view'&&true||false
        },
        readAdd: function (){
            return this.opeType!='add'&&true||false
        }
    },
    events: {
        'ztree-panel':function(msg){
            if(this.statu == 'open')
            {
                if(msg=='open')
                {
                    this.$el.style.right = '340px'
                }
                else if(msg=='close'){
                    this.$el.style.right = '0px';
                }
            }
            
        }
    }
});
Vue.component('form-panel-pro',{
    template: '<div :class="[\'content-right\',twoColumn&&\'content-right-wider\',opeType==\'view\'&&\'content-view\']" >'+
                '<div class="class-cr clearfix">'+
                    '<slot name="title">'+
                        '<a class="item-btn hover">'+
                            '<i class="icon-pencil"></i>'+
                            '<span class="operName1">{{autoTitle}}</span>'+
                        '</a>'+
                        '<p class="item-list2">'+
                            '<template v-if="customOpera">'+
                                '<template v-for="item in customOpera">'+
                                    '<a href="javascript:;" class="item-btn"  v-on:click="item.operaFun()">{{item.name}}</a>'+
                                '</template>'+
                                '<a href="javascript:;" class="item-btn item-btn2" v-on:click="close()"><i class="icon-remove"></i>关闭</a>'+
                            '</template>'+
                            '<template v-else>'+
                                '<a href="javascript:;" class="item-btn item-btn1" v-on:click="saveMess()" v-show="opeType!=\'view\'"><i class=" icon-ok"></i>保存</a>'+
                                '<a href="javascript:;" class="item-btn item-btn2" v-on:click="close()"><i class="icon-remove"></i>关闭</a>'+
                            '</template>'+
                        '</p>'+
                    '</slot>'+
                '</div>'+
                '<div class="content-con">'+
                    '<form v-el:form>'+
                    '<div class="form-block">'+
                        '<template v-if="form.title">'+
                            '<p class="title-switch">'+
                                '<span>{{form.title}}</span>'+
                            '</p>'+
                        '</template>'+
                        '<template v-for="item in form.data">'+
                            '<template v-if="item.type==\'text\'||item.type==\'number\'||item.type==\'file\'||item.type==\'password\'||item.type==\'email\'">'+
                    '            <div :class="[\'form-group\',item.validate&&item.validate.required&&\'required\',item.operaFun&&\'specialOpera\',item.roasnm&&\'roasnm\']">'+
                    '                <label>{{item.name}}{{item.ps}}</label>'+
                    '                <input type="{{item.type}}"  id="{{item.id}}" name="{{item.field}}" :class="[\'form-control\']" accept="{{item.accept}}" checked="{{item.checked}}" v-model="formData[item.field]" max="{{item.max}}" min="{{item.min}}" maxlength="{{item.maxlength}}" multiple="{{item.multiple}}" v-bind:readonly="item.readonly==true&&readAdd||item.readonly==\'ever\'&&true||readonly" v-on:click="item.operaFun&&inputOpera(item.operaFun)">'+
                    '            </div>'+
                    '        </template>'+
                    '        <template v-if="item.type==\'date\'">'+
                                '<div :class=[\'form-group\',\'roasnm\',\'form-group-date\',item.validate&&item.validate.required&&\'required\']>'+
                                    '<label>{{item.name}}</label>'+
                    '                <input type="text"  id="{{item.id}}" :readonly="item.readonly==true&&readAdd||item.readonly==\'ever\'&&true||readonly" class="form-control" name="{{item.field}}"  v-model="formData[item.field]">'+
                                '</div>'+
                    '        </template>'+
                    '        <template v-if="item.type==\'radio\'">'+
                    '            <div :class="[\'form-group\',\'form-group-long\',item.validate&&item.validate.required&&\'required\']">'+
                    '                <label>{{item.name}}</label>'+
                    '                <template v-for="item2 in item.radio">'+
                    '                    <span class="form-chose">'+
                    '                        <input type="radio" name="{{item.field}}" id="{{item2.id}}" value="{{item2.value}}" v-model="formData[item.field]" :disabled="item2.disabled==true&&readAdd||item2.disabled==\'ever\'&&true||disabled">'+
                    '                        <label for="{{item2.id}}">{{item2.name}}</label>'+
                    '                    </span>'+
                    '                </template>'+
                    '            </div>'+
                    '        </template>'+
                    '        <template v-if="item.type==\'checkbox\'">'+
                    '            <div :class="[\'form-group\',\'form-group-long\',item.validate&&item.validate.required&&\'required\']">'+
                    '                <label>{{item.name}}</label>'+
                    '                <template v-for="item2 in item.checkbox">'+
                    '                    <span class="form-chose">'+
                    '                        <input type="checkbox" name="{{item.field}}" id="{{item2.id}}" value="{{item2.value}}" v-model="formData[item.field]"  :disabled="item2.disabled==true&&readAdd||item2.disabled==\'ever\'&&true||disabled">'+
                    '                        <label for="{{item2.id}}">{{item2.name}}</label>'+
                    '                    </span>'+
                    '                </template>'+
                    '            </div>'+
                    '        </template>'+
                    '        <template v-if="item.type==\'select\'">'+
                                '<div :class="[\'form-group\',item.validate&&item.validate.required&&\'required\']">'+
                                    '<label>{{item.name}}</label>'+
                                    '<select-stand :id="item.id" :name="item.field" :info-type="item.select.infoTypes" :type="item.select.type" :readonly="item.readonly==true&&readAdd||item.readonly==\'ever\'&&true||readonly" :auto-chose="item.field" :auto-chose-cn="item.select.fieldCn" :localdata="item.select.localdata" :url="item.select.url" :after-chose="item.select.afterChose" :before-chose="item.select.beforeChose" :custom-field="item.select.customField" :spread-event="item.select.spreadEvent" :paras="item.select.paras" :link-field="item.select.linkField">'+
                                    '</select-stand>'+
                                    // '<select-search :id="item.id" :info-type="item.select.infoTypes" :type="item.select.type" :readonly="readonly" :auto-chose="item.field" :auto-chose-cn="item.select.fieldCn" :localdata="item.select.localdata" :table="item.select.table" :search="item.select.search" :after-chose="item.select.afterChose" :before-chose="item.select.beforeChose" :custom-field="item.select.customField" :spread-event="item.select.spreadEvent" :paras="item.select.paras" :linkage="item.select.linkage" >'+
                                    // '</select-search>'+
                                '</div>'+
                    '        </template>'+
                    '        <template v-if="item.type==\'textarea\'">'+
                    '            <div :class="[\'form-group\',\'form-group-long\',item.validate&&item.validate.required&&\'required\']">'+
                    '                <label>{{item.name}}</label>'+
                    '                <textarea class="form-control" :id="item.id" :name="item.field" :cols="item.col" :rows="item.row" v-model="formData[item.field]" v-on:click="item.operaFun&&inputOpera(item.operaFun)" :readonly="item.readonly==true&&readAdd||item.readonly==\'ever\'&&true||readonly"></textarea>'+
                    '            </div>'+
                    '        </template>'+
                    '        <template v-if="item.type==\'image\'">'+
                    '            <div :class="[\'form-group\',\'form-group-long\']">'+
                    '                <label>{{item.name}}</label>'+
                    '                <img src="{{formData[item.field]}}" width="{{item.image.width}}">'+
                    '            </div>'+
                    '        </template>'+
                    '        <template v-if="item.type==\'button\'">'+
                    '            <div class="form-group form-group-long">'+
                    '                <label>{{item.name}}</label>'+
                    '                <template v-for="item2 in item.button">'+
                    '                    <a href="javascript:void(0);" v-on:click="item2.operaFun()" :class="[\'btn\',\'btn-stand\',item2.className||\'\']" :disabled="item2.disabled"  :id="item2.id">{{item2.name}}</a>  '   +
                '                     </template>'+     
                    '            </div>'+
                    '        </template>'+
                        '</template>'+
                        '<template v-if="statusForm.title">'+
                            '<p class="title-switch">'+
                                '<span>{{statusForm.title}}</span>'+
                            '</p>'+
                            '<template v-for="item in statusForm.data">'+
                                '<div class="form-group">'+
                                    '<label>{{item.name}}</label>'+
                                    '<input type="text" class="form-control" v-model="formData[item.field]" required v-bind:readonly= \'true\' >'+
                                '</div>'+
                            '</template>'+
                        '</template>'+
                        
                        '<template v-if="passWordOpera.title">'+
                            '<p class="title-switch" href="javascript:;">'+
                                '<span>{{passWordOpera.title}}</span>'+
                            '</p>'+
                            '<template v-for="item in passWordOpera.data">'+
                                '<p class="lock-con">'+
                                    '<i class="icon-lock"></i>'+
                                    '<button v-on:click="item.operaFun()" class="btn btn-disabled" disabled>{{item.name}}</button>'+
                                '</p>'+
                            '</template>'+
                        '</template>'+
                    '</div>'+
                    '</form>'+
                    '<div class="loding-con" style="display:none">'+
                        '<p class="loding"><span></span><span></span><span></span><span></span><span></span><span></span></p>'+
                    '</div>'+
                '</div>'+
              '</div>',
    props: ['saveUrl','reqUrl','form','statusForm','passWordOpera','refresh','saveFun','openFun','closeFun','twoColumn','formSubmit','customOpera','dataReady','beforeSave'],
    data: function(){
        return {
            opeType: '', //操作类型,add,view,edit
            opeFid: '', //被操作fid
            num: 0,
            statu: '', //开关状态
            formData:{},
            ready: '',//数据是否就绪
            selectGroup: [],
            width: 300,
            vali:'' 
        }
        
    },
    ready: function(){
        this.valiSet={
            debug: true,
            onsubmit: false,
            onkeyup:false,
            errorElement: 'p',
            errorClass:'form-wrong',
            rules: {

            }
        };
        var form=this.form.data;
        //初始化特殊表单控件
        var dateSet={};
        for(var i=0;i<form.length;i++)
        {
            //select
            if(form[i].type=='select')
            {
                this.selectGroup.push(i)
            }
            //date
            else if(form[i].type=='date'){
                // console.log(0)
                // laydate(form[i].date);
                if(!form[i].id) 
                {
                    console.log('date组件需要配置id');
                }
                dateSet = form[i].date;
                dateSet.scrollInput = false;
                $('#'+form[i].id).datetimepicker(form[i].date);

            }
            if(form[i].validate)
            {
                this.valiSet.rules[form[i].field] = form[i].validate;
            }
            if(form[i].customValidate)
            {
                form[i].customValidate();
            }

            // this.$set('formData[form[i].field]','');
        }
        if(this.twoColumn)
        {
            this.width = 550;
            this.$el.style.width = this.width+'px';
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
            for(var i=0;i<form.length;i++)
            {
                if(all||this.formData[form[i].field]==null||this.formData[form[i].field]==undefined)
                {
                    if(form[i].type!='checkbox')
                    {
                        Vue.set(this.formData,form[i].field,'');
                        if(form[i].dataField)
                        {
                           Vue.set(this.formData,form[i].dataField,''); 
                        }
                    }
                    else{
                        Vue.set(this.formData,form[i].field,[]);
                    }
                    
                }
            }
        },
        open: function(type) {
            this.$el.style.right = '0px';
            if(type == undefined)
            {
                type = 'add';
            }
            this.statu = 'open';
            this.opeType = type;
            if(type == 'add')
            {
                this.$broadcast('formAdd');
                this.processEmptyField(true);
                // this.checkbox();
            }
            this.openFun&&this.openFun();
        },
        close: function() {
            this.loding(0);
            this.$el.style.right = -this.width+'px';
            this.$parent.$broadcast('form-panel', 'close');    
            this.statu = 'close';      
            this.opeType = '';
            this.opeFid = '';
            this.validateFun.resetForm();
            this.closeFun&&this.closeFun();
        },
        req: function(fidpre,type) {
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
                data: {"fid": fidpre},
                success: function (data) {
                    if (num2 == self.num) {
                        self.formData = data;
                        self.opeFid = fidpre;
                        self.$broadcast('formDataReady',data);
                        var form=self.form.data;
                        //初始化checkbox
                        self.checkbox();
                        self.loding(0);
                        self.ready = true;
                        self.processEmptyField();
                        self.dataReady&&self.dataReady(data);
                        //访问select
                        // for(var i=0;i<self.selectGroup.length;i++)
                        // {
                        //     self.$children[i].choseSome(data[self.form.data[self.selectGroup[i]].field])
                        // }
                        // selectStatu.$refs.select1.choseSome(self.items.fcodeType)
                    }
                },
                error:function () { 
                    self.loding(0);
                 }
            });
        },
        blur: function (field,id) { 
            //处理类似于date等组件的数据绑定
            // var self = this;
            // setTimeout(function () { 
            //     self.formData[field] = document.querySelector('#'+id).value;
            //  },100)
        },
        //处理多选的格式,逗号隔开
        checkbox: function (startOrEnd,data) { 
            var form = this.form.data;
            if(startOrEnd == 'start'||startOrEnd == null||startOrEnd == undefined)
            {
                for(var i=0;i<form.length;i++)
                {
                    if(form[i].type=='checkbox'){
                        this.formData[form[i].field] = this.formData[form[i].field].split(',');
                    }
                }
            }
            else if(startOrEnd == 'end')
            
            for(var i=0;i<form.length;i++)
            {
                if(form[i].type=='checkbox'){
                    data[form[i].field] = data[form[i].field].join(',');
                }
            }
         },
        valid: function(){
            if(!$(this.$el.querySelector('form')).valid()) return false
        },
        clone:function (obj) {  
            return JSON.parse( JSON.stringify( obj ) );
        },
        getFormData: function(){
            //获取子组件的值
            for(var i=0;i<this.selectGroup.length;i++)
            {
                this.formData[this.form.data[this.selectGroup[i]].field] = this.$children[i].val();
            }

            var formData = this.clone(this.formData);
            for(var m in formData)
            {
                formData[m] = htmlEncode(formData[m])
            }
            //处理checkbox
            this.checkbox('end',formData);
            return formData
        },
        saveMess: function() {
            if(this.opeType=='edit'&&!this.ready) return
            // if(!this.valid()) return false;
            if(!this.validateFun.form()) return false;
            var self = this;
            //获取子组件的值
            for(var i=0;i<self.selectGroup.length;i++)
            {
                this.formData[this.form.data[this.selectGroup[i]].field] = self.$children[i].val();
            }

            var formData = this.clone(this.formData);
            for(var m in formData)
            {
                formData[m] = htmlEncode(formData[m])
            }
            //处理checkbox
            this.checkbox('end',formData);
            if(!this.saveFun)
            {
                debugger
                
                if (this.opeType == 'add' || this.opeType == 'edit') {
                    if(!this.formSubmit)
                    {
                        
                    }
                    if(!self.saveUrl) return
                    if(self.beforeSave)
                    {
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
                            self.afterSaveFun&&self.afterSaveFun();
                            // self.refresh();
                            // content.$refs.table1.pgChange(1);
                        },
                        error:function () { 
                            self.loding(0);
                        }
                    });
                } else {
                    self.close();
                }
            }
            else{
                this.saveFun();
            }
            

        },
        //如果只读，操作函数失效
        inputOpera: function(fun){
            if(!this.readonly)
            {
                fun();
            }
        },
        loding: function (para) { 
            if(para)
            {
                this.$el.querySelector('.loding-con').style.display='block';
            }
            else
            {
                this.$el.querySelector('.loding-con').style.display='none';
            }
         },

    },
    computed:{
        readonly: function (){
            return this.opeType=='view'&&true||false
        },
        readAdd: function (){
            return this.opeType!='add'&&true||false
        },
        autoTitle: function(){
            return this.opeType=='add'&&'新增'||this.opeType=='edit'&&'编辑'||this.opeType=='view'&&'查看'||' '
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
        'ztree-panel':function(msg){
            if(this.statu == 'open')
            {
                if(msg=='open')
                {
                    this.$el.style.right = '340px'
                }
                else if(msg=='close'){
                    this.$el.style.right = '0px';
                }
            }
            
        }
    }
});
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
Vue.component('head-search',{
    template: '<div class="item-search">'+
                '<form>'+
                    '<template v-for="item in form">'+
                            '<template v-if="item.type==\'text\'||item.type==\'number\'||item.type==\'file\'||item.type==\'password\'">'+
                    '            <div :class="[\'form-group\',item.required&&\'required\']">'+
                    '                <label>{{item.name}}</label>'+
                    '                <input type="{{item.type}}" id="{{item.id}}" name="{{item.field}}" class="form-control" accept="{{item.accept}}" checked="{{item.checked}}" v-model="formData[item.field]" max="{{item.max}}" min="{{item.min}}" maxlength="{{item.maxlength}}"  maxlength="item.id" multiple="{{item.multiple}}" v-on:click="item.operaFun&&inputOpera(item.operaFun)" >'+
                    '            </div>'+
                    '        </template>'+
                    '        <template v-if="item.type==\'date\'">'+
                                '<div :class=[\'form-group\',\'form-group-date\',item.required&&\'required\']>'+
                                    '<label>{{item.name}}</label>'+
                    '                <input type="text"  id="{{item.id}}" name="{{item.field}}" lazy class="form-control"  v-model="formData[item.field]" >'+
                                '</div>'+
                    '        </template>'+
                    '        <template v-if="item.type==\'radio\'">'+
                    '            <div :class="[\'form-group\',\'form-group-long\',item.required&&\'required\']">'+
                    '                <label>{{item.name}}</label>'+
                    '                <template v-for="item2 in item.radio">'+
                    '                    <span class="form-chose">'+
                    '                        <input type="radio" name="{{item2.field}}" id="{{item2.id}}" value="{{item2.value}}" v-model="formData[item.field]">'+
                    '                        <label for="{{item2.field}}">{{item2.name}}</label>'+
                    '                    </span>'+
                    '                </template>'+
                    '            </div>'+
                    '        </template>'+
                    '        <template v-if="item.type==\'checkbox\'">'+
                    '            <div :class="[\'form-group\',\'form-group-long\',item.required&&\'required\']">'+
                    '                <label>{{item.name}}</label>'+
                    '                <template v-for="item2 in item.checkbox">'+
                    '                    <span class="form-chose">'+
                    
                    '                        <input type="checkbox" name="{{item2.id}}" id="{{item2.id}}" value="{{item2.value}}" v-model="formData[item.field]" :disabled="item2.disabled">'+
                    '                        <label for="{{item2.id}}">{{item2.name}}</label>'+
                    '                    </span>'+
                    '                </template>'+
                    '            </div>'+
                    '        </template>'+
                    '        <template v-if="item.type==\'select\'">'+
                                '<div :class="[\'form-group\',item.required&&\'required\']">'+
                                    '<label>{{item.name}}</label>'+
                                    '<select-stand :info-type="item.select.infoTypes" :type="item.select.types" :readonly="readonly" :auto-chose="item.field" :localdata="item.select.localdata" :url="item.select.url" :after-chose="item.select.afterChose" :before-chose="item.select.beforeChose" :custom-field="item.select.customField" :spread-event="item.select.spreadEvent" :paras="item.select.paras" :link-field="item.select.linkField">'+
                                    '</select-stand>'+
                                '</div>'+
                    '        </template>'+
                        '</template>'+
                    '<form>'+
                    '<br>'+
                    '<a href="javascript:;" class="btn btn-search" v-on:click="search">查询</a>'+
                    '<a href="javascript:;" class="btn btn-undo" v-on:click="revoke">'+
                        '<i class="icon-undo"></i>'+
                        '<span>撤销</span>'+
                    '</a>'+
                    // '<a type="button" class="btn btn-search-ad" v-on:click:advanced>'+
                    //     '<span class="caret"></span>'+
                    //     '<b>高级搜索</b>'+
                    // '</a>'+
                '</div>',
    props: ['form','searchFun','revokeFun','readyFun'],
    data: function () { 
        return {
            formData: {},
            selectGroup: []
        }
     },
    ready: function () { 
        if(this.form)
        {
            for(var i=0;i< this.form.length;i++)
            {
                if(!this.form[i].defaultValue)
                {
                    Vue.set(this.formData,this.form[i].field,'');
                }
                else{
                    Vue.set(this.formData,this.form[i].field,this.form[i].defaultValue);
                }
                if(this.form[i].type=='select')
                {
                    this.selectGroup.push(i)
                }
                else if(this.form[i].type=='date'){
                    // laydate(this.form[i].date);
                    $('#'+this.form[i].id).datetimepicker(this.form[i].date);
                }
            }
        }
        this.readyFun&&this.readyFun();
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
        search: function() {
            this.getFormData();
            this.searchFun&&this.searchFun(this.formData);
        },
        getFormData: function(){
            var forms = this.$el.querySelector('form');
            var newFormData = new FormData(forms);
            for(var i=0;i<this.selectGroup.length;i++)
            {
                this.formData[this.form[this.selectGroup[i]].field] = this.$children[i].val();
            }
            for( m in this.formData)
            {
                this.formData[m] = htmlEncode(this.formData[m])
            }
            return this.formData
        },
        //撤销
        revoke: function() {
            var formAll = this.$el.querySelectorAll('input');
            for(var i = 0; i<formAll.length;i++)
            {
                formAll[i].value='';
            }
            var children = this.$children;
            for(var m in this.formData)
            {
                this.formData[m]=''
            }
            this.$broadcast('clear');
            this.revokeFun&&this.revokeFun();
        },
        //高级搜索
        advanced: function() {

        }
    }
});
var urls={
    list: 'json/list11.json',
    search: '',
};
var content = new Vue({
    el: '#content-list',
    data: function () { 
            return {
                search: {
                    form: [
                        {
                            name: "年月",
                            type: 'date',
                            field: 'ct1',
                            id: 'date5',
                            date: {
                                step: 5,
                                format: 'Y-m-d',
                                timepicker: false
                            }
                        },
                        {
                            name: "工号",
                            type: "text",
                            field: 'ct2',
                        },
                        {
                            name: "姓名",
                            type: "text",
                            field: 'ct3',
                        }
                    ],
                    serachFun: function (data) {  
                        content.$refs.table1.setSearch(data);
                    },
                    revokeFun:  function () {
                        content.$refs.table1.clearSearch();
                      },
                },
                
                table: {
                    list: '', //表格数据
                    thead: [ //表头数据
                        {
                            name: "单据编码",
                            field: "fuserName",
                            width: "200"
                        },
                        {
                            name: "工号",
                            field: "fpersonnelCode",
                            width: "200"
                        },
                        {
                            name: "姓名",
                            field: "fpersonnelName",
                            width: "200"
                        },
                        {
                            name: "正常出勤（天）",
                            field: "fnuber",
                            width: "200"
                        },
                        {
                            name: "请假（小时）",
                            field: "fnuber",
                            width: "200"
                        },
                        {
                            name: "缺勤（天）",
                            field: "fnuber",
                            width: "200"
                        },
                        {
                            name: "迟到早退（次）",
                            field: "fnuber",
                            width: "200"
                        }
                    ],
                    skipNum: '',
                    must: {
                        pageSize: 15,
                        currentPage: 1,
                    },
                    search: '',
                    url: urls.list,
                },
            }
    }
}); 


Vue.component('menu-ztree',{
    template: '<div class="content-left" id ="content-left">'+
                '<p href="#" class="scrollbtn slt" style="display:none">'+
                    '<i class="icon-sort-up"></i>'+
                '</p>'+
                '<p href="#" class="scrollbtn slb" style="display:none">'+
                    '<i class="icon-sort-down"></i>'+
                '</p>'+
                '<div class="scroll" id="ztree-scroll">'+
                    '<div class="ztree" id="{{treeId}}">'+
                    '</div>'+
                '</div>'+
              '</div>',
    props: ['ztreeSet','treeId'], //ztree设置和id设置
    ready: function(){
        var setting = this.ztreeSet;
        // if(this.ztreeSet.async&&this.ztreeSet.async.enable)
        // {
            $.fn.zTree.init($("#"+ this.treeId), this.ztreeSet);
        // }
        scrollZtree('content-left','ztree-scroll');
        if(this.$parent&&this.$parent.$el.querySelector('.content-list'))
        {
            this.$parent.$el.querySelector('.content-list').style.left = "170px";
        }
    },
    methods: {

    }
});
var ordinListVue = Vue.component('ordin-list',{
    template: '<div class="fold-list ordin-list">'+
                '<table class="table-stand table-stand-head">'+
                    '<thead>'+
                        '<tr>'+
                            '<template v-if="columnHead">'+
                                '<th width="{{columnHead.width}}"></th>'+
                            '</template>'+
                            '<template v-if="serialNum">'+
                                '<th width="40"></th>'+
                            '</template>'+
                            '<th v-for="item in head"  width="{{item.width}}">{{item.name}}</th>'+
                            '<th v-if=\'viewFun\'>操作</th>'+
                        '</tr>'+
                    '</thead>'+
                '</table>'+
                '<div class="fold-list-main scroll-stand">'+
                    '<table class="table-stand">'+
                        '<thead>'+
                            '<tr>'+
                               '<template v-if="columnHead">'+
                                    '<th width="{{columnHead.width}}"></th>'+
                                '</template>'+
                                '<template v-if="serialNum">'+
                                    '<th width="40"></th>'+
                                '</template>'+
                                '<th v-for="item in head"  width="{{item.width}}"></th>'+
                                '<th v-if=\'viewFun\'></th>'+
                            '</tr>'+
                        '</thead>'+
                    // '<div class="fold-list-main scroll-stand">'+
                        '<tbody>'+
                            '<template v-if="!columnHead">'+
                                '<tr v-for="item in list" fid="{{mark&&item[mark]||item.fid}}">'+
                                    '<template v-if="serialNum">'+ 
                                        '<td>{{($index+1)}}</td>'+
                                    '</template>'+
                                    '<template v-for="headItem in head">'+
                                        '<template v-if="typeof headItem.getter == \'undefined\'">'+ 
                                            '<td title={{item[headItem.field]}}>{{item[headItem.field]}}</td>'+
                                        '</template>'+
                                        '<template v-else>'+ 
                                            '<td>{{headItem.getter(item[headItem.field])}}</td>'+
                                        '</template>'+
                                    '</template>'+
                                    '<td fid="{{item.fid}}" v-if=\'viewFun\'>'+
                                        '<a href="javascript:;">查看</a>'+
                                        '<template v-for="item2 in opera">'+
                                            '<i class="vertical"></i>'+
                                            '<a href="javascript:;" >{{item2.name}}</a>'+
                                        '</template>'+
                                    '</td>'+
                                '</tr>'+
                            '</template>'+
                            '<template v-else>'+
                                    '<tr v-for="item2 in columnHead.name" fid="{{$index}}">'+
                                        '<td>{{item2}}</td>'+
                                        // '<template v-for="headItem in head">'+
                                        //     '<template v-if="typeof headItem.getter == \'undefined\'">'+ 
                                        //         '<span>{{list[$index][headItem.field]}}</span>'+
                                        //     '</template>'+
                                        //     '<template v-else>'+ 
                                        //         '<span>{{headItem.getter(list[$index][headItem.field])}}</span>'+
                                        //     '</template>'+
                                        // '</template>'+
                                        '<template v-for="headItem in head">'+
                                            '<template v-if="typeof headItem.getter == \'undefined\'">'+ 
                                                '<td title={{list[headItem.field[$parent.$index]]}}>{{list[headItem.field[$parent.$index]]}}</td>'+
                                            '</template>'+
                                            '<template v-else>'+ 
                                                '<td>{{headItem.getter(list[headItem.field[$parent.$index]],headItem.field[$parent.$index])}}</td>'+
                                            '</template>'+
                                        '</template>'+
                                        '<td fid="{{list[$index].fid}}" v-if=\'viewFun\'>'+
                                            '<a href="javascript:;">查看</a>'+
                                            '<template v-for="item2 in opera">'+
                                                '<i class="vertical"></i>'+
                                                '<a href="javascript:;" >{{item2.name}}</a>'+
                                            '</template>'+
                                        '</td>'+
                                    '</tr>'+
                            '</template>'+
                            
                        '</tbody>'+
                    // '</div>'+
                    '</table>'+
                '</div>'+                
                '<div class="loding-con" style="display:none">'+
                    '<p class="loding"><span></span><span></span><span></span><span></span><span></span><span></span></p>'+
                '</div>'+
              '</div>',
    props: ['url','head','must','opera','itemClick','viewFun','mark','columnHead','serialNum'],
    data: function(){
        return {
            list: {},
            fid: '',//当前选中
            numCount: 0
        }
    },
    ready: function(){
        var self=this;
        if(self.url)
        {
            self.$el.querySelector('.loding-con').style.display='block';
            $.ajax({
                url : self.url,
                type : "GET",
                dataType :"JSON",
                success : function(data){
                    self.list=data;
                    self.$el.querySelector('.loding-con').style.display='none';
                },
                error: function () { 
                    if(self.$el.querySelector('.loding-con'))
                    {
                        self.$el.querySelector('.loding-con').style.display='none';
                    }
                 }
            });
        }
        
        //监听所有click事件
        this.$el.addEventListener('click',function(e){
            var fids;
            var targetData;
            if(e.target.tagName=='A')
            {
                fids = e.target.parentNode.parentNode.getAttribute('fid');
                self.fid=fids;
                targetData = self.searchData(self.list,fids);
                if(e.target.innerHTML=='查看')
                {
                    self.viewFun&&self.viewFun(targetData);
                }
                else
                {
                    for(var i=0;i<self.opera.length;i++)
                    {
                        if(e.target.innerHTML == self.opera[i].name)
                        {
                            self.opera[i].operaFun(targetData);
                        }
                    }

                }
                
            }
            else if(e.target.tagName=='TD')
            {
                fids = e.target.parentNode.getAttribute('fid');
                self.fid = fids;
                //双表头模式传入index
                if(!self.columnHead)
                {
                    targetData = self.searchData(self.list,fids);
                    if(e.target.parentNode.tagName=='TR')
                    {
                        self.numCount++;
                        self.itemClick&&self.itemClick(targetData);
                    }
                }
                else{
                    if(e.target.parentNode.tagName=='TR')
                    {
                        self.numCount++;
                        self.itemClick&&self.itemClick(fids,self.list);
                    }
                }
                
            }
            else { return}
            var lis = self.$el.getElementsByTagName('TR');
            for(var i = 0; i< lis.length; i++)
            {
                lis[i].className = '';
            }
            self.findParent(e.target,'TR').className = 'active';

        },false)
    },
    methods: {
        clearData: function(){
            this.fid='';
            this.list={};
        },
         findParent: function (child, parent) {
            var ulp = child, num = 0;
            while (ulp.tagName != parent && num < 10) {
                ulp = ulp.parentNode;
                num++;
            };
            return ulp;
        },
        setData: function(listData){
            this.list = listData;
            this.$el.querySelector('.loding-con').style.display = 'none';
        },
        searchData: function(datas,fids) {
            if(this.mark)
            {
                for (var i = 0;i < datas.length;i++)
                {
                    if(fids == datas[i][this.mark]){
                        return datas[i]
                    }
                }
            }
            else{
                for (var i = 0;i < datas.length;i++)
                {
                    if(fids == datas[i].fid){
                        return datas[i]
                    }
                }
            }
            
        },
        loding: function (para) { 
            if(para)
            {
                this.$el.querySelector('.loding-con').style.display='block';
            }
            else
            {
                this.$el.querySelector('.loding-con').style.display='none';
            }
         },
        refresh: function(){
            var self=this;
            if(self.url)
            {
                this.loding(1);
                $.ajax({
                    url : self.url,
                    type : "GET",
                    dataType :"JSON",
                    success : function(data){
                        self.list=data;
                        this.loding();
                    },
                    error: function () { 
                        if(self.$el.querySelector('.loding-con'))
                        {
                            this.loding();
                        }
                    }
                });
            }
        }

    }
});
Vue.component('role-pop',{
    template: '<ul v-bind:class="{\'role-open\':item.childrenList}" v-for="item in items" order={{$index}}>'+
                '<li fid={{item.fid}}>'+
                    '<span v-on:click.stop="switch" v-bind:style="{paddingLeft: pl + \'px\'}">'+
                        '<template v-if="item.childrenList.length>0">'+
                            '<a href="javascript:;" class="switchul"><i class="icon-angle-right"></i></a>'+
                        '</template>'+
                    '</span>'+
                    '<span v-bind:style="{paddingLeft: pl + \'px\'}">'+
                        '<input type="checkbox" id="{{\'cb\'+item.fid}}" fid={{item.fid}} namerole={{item.froleName}} v-bind:checked="item.checked"/>'+
                        '<label for="{{\'cb\'+item.fid}}">'+
                        '{{item.froleName}}'+
                        '</label>'+
                    '</span>'+
                '</li>'+
                '<template v-if="item.childrenList.length>0">'+
                    '<li>'+
                    '<role-pop :items=" item.childrenList" :padding="padding+1"></role-pop>'+
                    '</li>'+
                '</template>'+
            '</ul>',
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
});
var popVue = Vue.component('pop', {
    template: '<div>'+
                '<div class="ros-pop" style="display:none;">'+
                    '<p class="pop-title">'+
                        '{{title}}'+
                        '<span class="item-list2">'+
                            '<template v-if="saveFun">'+
                                '<a href="javascript:;" class="item-btn item-btn1" v-on:click="save()"><i class=" icon-ok"></i>保存</a>'+
                            '</template>'+
                            '<a href="javascript:;" class="item-btn item-btn2" v-on:click="close()"><i class=" icon-remove"></i>关闭</a>'+
                        '</span>'+
                    '</p>'+
                    '<div class="pop-con">'+
                        '<div class="loding-con" style="display:none">'+
                            '<p class="loding"><span></span><span></span><span></span><span></span><span></span><span></span></p>'+
                        '</div>'+
                        '<slot>'+
                            '<div class="role-pop">'+
                                '<role-pop :items="items" :padding="0">'+
                                '</role-pop>'+
                            '</div>'+
                        '</slot>'+
                        
                    '</div>'+
                '</div>'+
                '<div class="shade"></div>'+
            '</div>',
    props: ['title','url','saveFun','customScreen','width','height','closeFun'], 
    data: function(){
        return {
            items: '',
            statu: 'close',
            init: false,
            source: ''
        }
    },
    ready: function(){
        var self = this;
        //如果是自定义宽高，防止宽高超出范围
        if(this.customScreen)
        {
            this.$el.querySelector('.ros-pop').className="ros-pop custom-screen-pop";
            var width = document.documentElement.clientWidth;
            var height = document.documentElement.clientHeight;
            width = width > this.width? this.width:width;
            height = height > this.height? this.height:height;
            this.$el.querySelector('.ros-pop').style.cssText="display:none;position:absolute;width: "+width+"px;height:"+height+"px;margin: 0;";
            window.addEventListener('resize',function(){
                width = document.documentElement.clientWidth;
                height = document.documentElement.clientHeight;
                width = width > self.width? self.width:width;
                height = height > self.height? self.height:height;
                self.$el.querySelector('.ros-pop').style.width=width+"px";
                self.$el.querySelector('.ros-pop').style.height=height+"px";
            },false)
        }
        //获取数据
        if(this.url)
        {
            self.$el.querySelector('.loding-con').style.display='block';
            
            $.ajax({
                url: self.url,
                type: "GET",
                cache: false,
                dataType: 'JSON',
                success: function (data) {
                    self.items = data;
                    self.$el.querySelector('.loding-con').style.display='none';
                },
                error: function () { 
                    self.$el.querySelector('.loding-con').style.display='none';
                 }
            });
        }
        
    },
    methods: {
        open: function () {
            if(!this.init)
            {
                this.init = true;
            }
            this.$el.querySelector('.ros-pop').style.display = 'block';
            this.$el.querySelector('.shade').style.display = 'block';
            this.statu = 'open';
        },
        close: function () {
            this.$el.querySelector('.ros-pop').style.display = 'none';
            this.statu = 'close';
            this.$el.querySelector('.shade').style.display = 'none';
            this.source='';
            this.closeFun&&this.closeFun();
        },
        //选中
        check: function (id) {
            if(id)
            {
                var $inputs = this.$el.querySelector('.pop-con').getElementsByTagName('input');
                //            var ids = rightInfo.items.roleIds;
                var fid = '', m = 0;
                var ids = id.split(',');
                if (ids) {
                    for (var i = 0; i < $inputs.length; i++) {
                        fid = $inputs[i].getAttribute('fid');
                        $inputs[i].checked = false;
                        for (m = 0; m < ids.length; m++) {
                            if (fid == ids[m]) {
                                $inputs[i].checked = true;
                                break
                            }
                        }
                    };
                }
                else {
                    for (var i = 0; i < $inputs.length; i++) {
                        fid = $inputs[i].getAttribute('fid');
                        $inputs[i].checked = false;
                    };
                }
            }
            this.open();
        },
        save: function () {
            var $inputs = this.$el.querySelector('.ros-pop').getElementsByTagName('input');
            var inputCheckedId = [], inputCheckedName = [];
            for (var i = 0; i < $inputs.length; i++) {
                if ($inputs[i].checked) {
                    inputCheckedId.push($inputs[i].getAttribute('fid'));
                    inputCheckedName.push($inputs[i].getAttribute('namerole'));
                }
            }
            // for(var m = 0; m < this.filed.length ; m++)
            // {
            //     this.filed[0] = inputCheckedName.join(',');
            //     this.filed[0] = inputCheckedId.join(',');                
            // }
            this.saveFun(inputCheckedName.join(','),inputCheckedId.join(','))
            this.close();
        }
        
    }
});
Vue.component('select-search', {
    template: '<div class="select-group">' +
        '<div v-bind:class="{\'select-stand\':true,\'select-stand-readonly\': readonly}">' +
            '<div class="btn-select dropdown-toggle" data-toggle="dropdown" v-on:click="toggle">' +
                '<input type="text" class="select-value" data-val={{chosePre.fval}} name="{{autoChose}}" id="{{id}}" v-model="chosePre.fcn" readonly >' +
                '<span class="caret"></span>' +
            '</div>' +
            '<template v-if="type!=\'search\'">' +
                '<div class="dropdown-menu scroll-stand" style="display:none">' +
                    '<template v-if="type==\'single\'">' +
                        '<ul>' +
                            '<li data-val="" >' +
                                '<label v-on:click="chose($event)">...</label>' +
                            '</li>' +
                            '<li v-for="item in list"  data-val={{item[customField.val]}} >' +
                                '<label v-on:click="chose($event)">{{item[customField.cn]}}</label>' +
                            '</li>' +
                        '</ul>' +
                    '</template>' +
                    '<template v-if="type==\'multi\'">' +
                        '<ul>' +
                            '<li v-for="item in list" v-on:click="chose($event)" data-val={{item[customField.val]}} >' +
                                '<input type="checkbox" id=\'multi{{$index}}\'/><label for=\'multi{{$index}}\'>{{item[customField.cn]}}</label>' +
                            '</li>' +
                        '</ul>' +
                    '</template>' +
                '</div>' +
                '</template>' +
                '<template v-else>' +
                    '<div class="dropdown-menu dropdown-menu-search scroll-stand " style="display:block">' +
                        '<head-search :form="search.form" :search-fun="searchFun" :revoke-fun="revokeFun"></head-search>'+
                        '<div class="table-con">'+
                        '<p class="select-table-title">请点击选择：'+
                            '<template v-for="item in multiCn">'+
                                '<span> {{item}} <a href="javascript:void(0);" @click="deleteChose($index)" class="icon-remove"></a></span>'+
                            '</template>'+
                        '</p>'+
                        '<table-stand :list="table.list" :thead="table.thead" :must="table.must" :url="table.url" :click-fun="clickFun"></table-stand>'+
                        '</div>'+
                    '</div>' +
                '</template>' +
        '</div>' +
    '</div>',
    props: ['position', 'search','table',   
    'infoType', 'type','id', 'readonly', 'localdata', 'auth', 'url', 'autoChose','autoChoseCn', 'afterChose', 'beforeChose', 'spreadEvent','customField','paras','linkage'], 
    data: function(){
        return {
            list: '', //选项fcodeKey,fcodeValue_cn或者自定义
            chosePre: {
                fval: '',
                fcn: ''
            }, //当前选中
            willChose: '',//要选择的值，避免还未返回数据时要选中值的情况
            islistReady: false,
            multi: [], //存储分隔好的多选数据
            multiCn:[],
            // statu: false //状态，是否显示
            //autoChose 自动选择的对应form字段的key
            //customField 自定义值和文字字段customField{val:asd,cn:asd}
            //spreadEvent展开事件
            //paras自定义参数
            //type==search 除了autoChose，还需要autoChoseCn
            searchFun: function (data) {  
                var self = this.$parent;
                self.$children[1].setSearch(data);
                // console.log(this.url)
                // $.ajax({
                //     url: self.url,
                //     type: "GET",
                //     cache: false,
                //     dataType: 'JSON',
                //     data: self.must,
                //     success: function (data) {
                //         this.$parent.$children[1].setData(data)
                //     }
                // });
                self.$children[1].refresh();
            },
            revokeFun: function () { 
                this.$parent.$children[1].clearSearch();
             },
             //table
             clickFun: function (data) { 
                 var self = this.$parent;
                 for(var i = 0; i<self.multi.length;i++)
                 {
                     if(self.multi[i] == data[self.customField.val]) return false
                 }
                 self.multi.push(data[self.customField.val]);
                 self.multiCn.push(data[self.customField.cn]);
                 self.chosePre.fval = self.multi.join(',');
                 self.chosePre.fcn = self.multiCn.join(',');

             }
            
        }
    },
     ready: function () {
        var self = this;
        if(!this.type)
        {
            this.type = 'single';
        }
        if (!this.customField) {
            this.customField = {
                val: 'fcodeKey',
                cn: 'fcodeValue_cn'
            }
        }
        if (!this.localdata) {
            if (this.infoType) {
                if (!self.auth) {
                    self.auth = false
                }
                //默认请求地址
                if (!this.url) {
                    this.url = '/dictItem/list.json';
                }
                $.ajax({
                    url: self.url,
                    type: "GET",
                    dataType: "json",
                    data: {
                        "fcode": self.infoType,
                        "auth": self.auth
                    },
                    success: function (data) {
                        self.list = data;
                        self.islistReady = true;
                        if (self.willChose) {
                            self.choseSome(self.willChose);
                            self.willChose = '';
                        }
                    }
                })
            }
            else if(this.url&&!this.linkage) {
                //默认请求地址
                self.req(self.paras);
            }
        }
        else {
            this.list = this.localdata;
        }
    },
    methods: {
        deleteChose: function (index) {  
            this.multi.splice(index,1);
            this.multiCn.splice(index,1);
            this.chosePre.fval = this.multi.join(',');
            this.chosePre.fcn = this.multiCn.join(',');
        },
        //重置select
        clear: function () { 
            this.list = [];
            this.chosePre = {
                fval: '',
                fcn: ''
            }
        },
        setData: function (data) {
            this.list = data;
            this.islistReady = true;
            if (self.willChose) {
                self.choseSome(self.willChose);
                self.willChose = '';
            }
        },
        req: function (paras) { 
            var self = this;
            $.ajax({
                    url: self.url,
                    type: "GET",
                    dataType: "json",
                    data: paras,
                    success: function (data) {
                        self.list = data;
                        self.islistReady = true;
                        if (self.willChose) {
                            self.choseSome(self.willChose);
                            self.willChose = '';
                        }
                    }
                })
        },
        searchData: function (targetData) {
            var val = this.customField.val, cn = this.customField.cn, fcn = [];
            if (typeof targetData == 'string' || typeof targetData == 'number') {
                for (var key in this.list) {
                    if (this.list[key][val] == targetData) {
                        return this.list[key][cn]
                    }
                }
            }
            else if (typeof targetData == 'object') {
                for (var key in this.list) {
                    for (var m = 0; m < this.multi.length; m++) {
                        if (this.list[key][val] == this.multi[m]) {
                            fcn.push(this.list[key][cn]);
                        }
                    }

                }
                return fcn
            }

        },
        //点击
        chose: function (e) {
            var et = e.target, i = 0;
            while (et.tagName != "LI" && i < 10) {
                et = et.parentNode;
                i++;
            }
            if (this.type == 'multi') {
                // e.stopPropagation();
                if (e.target.tagName == "LABEL") return
                var allInput = et.parentNode.getElementsByTagName('INPUT');
                this.multi = [];
                for (var i = 0; i < allInput.length; i++) {
                    if (allInput[i].checked) {
                        this.multi.push(allInput[i].parentNode.getAttribute('data-val'));
                    }
                }
                this.choseSome(this.multi.join(','));
            }
            else if (this.type == 'single') {
                var wantChose = et.getAttribute('data-val');
                var wantChoseData = {
                        fval: wantChose,
                        fcn: this.searchData(wantChose)
                };
                if (this.beforeChose) {
                    this.beforeChose(wantChoseData) && this.choseSome(wantChose);
                }
                else {
                    this.choseSome(wantChose);
                }
                this.toggle();

            }

        },
        //选中
        choseSome: function (codekey) {
            //如果数据还未就绪，缓存要选择的值
            if (!this.islistReady) {
                this.willChose = codekey;
                return
            }
            if (codekey !== '' && codekey !== null && codekey !== undefined) {
                if (this.type == 'single') {
                    var targetData;
                    this.chosePre.fval = codekey;
                    this.chosePre.fcn = this.searchData(codekey);
                    this.afterChose && this.afterChose(this.chosePre);
                }
                else if (this.type == 'multi') {
                    this.chosePre.fval = codekey;
                    this.multi = codekey.split(',');
                    this.multiCn = this.searchData(this.multi);
                    this.chosePre.fcn = this.searchData(this.multi).join(',');
                    this.afterChose && this.afterChose(this.chosePre);
                }
                else if(this.type == 'search')
                {
                    //绑定cn
                    this.chosePre.fval = codekey;
                    this.chosePre.fcn = this.searchData(this.multi).join(',');
                    this.multi = this.chosePre.val.split(',');
                    this.multiCn = this.chosePre.cn.split(',');
                }

            }
            else {
                this.chosePre.fval = '';
                this.chosePre.fcn = '';
            }
        },
        //根据加载好的字段val选中，主要是multi类型
        check: function () {  
            if(this.type=='multi')
            {
                var inputs = this.$el.getElementsByClassName('dropdown-menu')[0].getElementsByTagName('LI');
                var inputAttr;
                for(var i =0; i < inputs.length;i++)
                {
                    inputAttr = inputs[i].getAttribute('data-val');
                    for(var m =0; m<this.multi.length;m++)
                    {
                        if(inputAttr == this.multi[m])
                        {
                            inputs[i].querySelector('input').checked = true;
                        }
                    }
                    
                }
            }
        },
        //返回选中值
        val: function () {
            return this.chosePre.fval
        },
        //切换
        toggle: function () {
            var allSelect = document.querySelectorAll('.select-group');
            var thisSelect = this.$el;
            for(var i = 0 ; i < allSelect.length; i++)
            {
                if(allSelect[i]!=thisSelect)
                {
                    allSelect[i].querySelector('.dropdown-menu').style.display='none';
                }
            }
            thisSelect = thisSelect.querySelector('.dropdown-menu');
            if(thisSelect.style.display =='block')
            {
                thisSelect.style.display ='none';
            }
            else{
                thisSelect.style.display ='block';
                if(this.type == 'multi')
                {

                }
                this.spreadEvent&&spreadEvent();
            }
        }
    },
    events: {
        'formDataReady': function (msg) {
            if(this.autoChose)
            {
                switch (this.type)
                {
                    case 'single': 
                        this.choseSome(msg[this.autoChose]);
                    break;
                    case 'multi': 
                        this.choseSome(msg[this.autoChose]);
                        this.check();
                    break;
                    case 'search': 
                        // this.choseSome(msg[this.autoChose]);
                        this.chosePre.fval = msg[this.autoChose];
                        this.chosePre.fcn = msg[this.autoChoseCn];
                        this.multi = this.chosePre.val.split(',');
                        this.multiCn = this.chosePre.cn.split(',');
                    break;
                }
                // if(this.type=='multi' || this.type == "search")
                // {
                    

                // }
                
                // if(this.type == 'single')
                // {
                //     this.choseSome(msg[this.autoChose]);
                // }
                
            }
        },
        'formAdd': function () {
            this.choseSome();
        },
        //清除选中
        'clear': function () {
            this.choseSome();
        }
    }
});
//select-stand操作部分
(function () {
    var isselect = false;//是否在select-stand内
    // $('body').on('click', '.btn-select', function (e) {
    //     if ($(this).parent().attr('class').indexOf('readonly') == -1) {
    //         $(this).next().toggle();
    //         // $(this).next().css('display','block');
    //     }
    // })
    // $("body").on('click', '.dropdown-menu', function (e) {
    //     $(this).toggle();
    // });
    $('body').on('mouseenter', '.select-stand', function () {
        isselect = true;
    });
    $('body').on('mouseleave', '.select-stand', function () {
        isselect = false;
    });
    $('body').on('click', function () {
        !isselect && $('.select-stand .dropdown-menu').css('display', 'none')
    });
} ());
Vue.component('select-stand', {
    template: '<div class="select-group">' +
        '<div v-bind:class="{\'select-stand\':true,\'select-stand-readonly\': readonly}">' +
            '<div class="btn-select dropdown-toggle" data-toggle="dropdown" v-on:click="toggle">' +
                '<input type="text" class="select-value" data-val={{chosePre.fval}} name="{{autoChose}}" id="{{id}}" v-model="chosePre.fcn" readonly >' +
                '<span class="caret"></span>' +
            '</div>' +
            '<template v-if="type!=\'pop\'">' +
                '<div class="dropdown-menu scroll-stand" style="display:none">' +
                    '<template v-if="type==\'single\'">' +
                        '<ul>' +
                            '<li data-val="" >' +
                                '<label v-on:click="chose($event)">...</label>' +
                            '</li>' +
                            '<li v-for="item in list"  data-val={{item[customField.val]}} >' +
                                '<label v-on:click="chose($event)">{{item[customField.cn]}}</label>' +
                            '</li>' +
                        '</ul>' +
                    '</template>' +
                    '<template v-if="type==\'multi\'">' +
                        '<ul class="multi-input">' +
                            '<li v-for="item in list" v-on:click="chose($event)" data-val={{item[customField.val]}} >' +
                                '<input type="checkbox" id=\'multi{{$index}}\'/><label for=\'multi{{$index}}\'>{{item[customField.cn]}}</label>' +
                            '</li>' +
                        '</ul>' +
                    '</template>' +
                '</div>' +
                '</template>' +
        '</div>' +
    '</div>',
    props: ['infoType', 'type','id', 'readonly', 'localdata', 'auth', 'url', 'autoChose', 'afterChose', 'beforeChose', 'spreadEvent','customField','paras','linkage','auto','linkField'],
    data: function () {
        return {
            list: '', //选项fcodeKey,fcodeValue_cn或者自定义
            chosePre: {
                fval: '',
                fcn: ''
            }, //当前选中
            willChose: '',//要选择的值，避免还未返回数据时要选中值的情况
            islistReady: false,
            multi: [] //存储分隔好的多选数据
            // statu: false //状态，是否显示
            //fcode:color请求所带参数
            //autoChose 自动选择的对应form字段的key
            //customField 自定义值和文字字段customField{val:asd,cn:asd}
            //spreadEvent展开事件
            //paras自定义参数
        }
    },
    ready: function () {
        var self = this;
        if(!this.type)
        {
            this.type = 'single';
        }
        if (!this.customField) {
            this.customField = {
                val: 'fcodeKey',
                cn: 'fcodeValue_cn'
            }
        }
        if (!this.localdata) {
            if (this.infoType) {
                if (!self.auth) {
                    self.auth = false
                }
                //默认请求地址
                if (!this.url) {
                    this.url = '/dictItem/list.json';
                }
                $.ajax({
                    url: self.url,
                    type: "GET",
                    dataType: "json",
                    data: {
                        "fcode": self.infoType,
                        "auth": self.auth
                    },
                    success: function (data) {
                        self.list = data;
                        self.islistReady = true;
                        if (self.willChose) {
                            self.choseSome(self.willChose);
                            self.willChose = '';
                        }
                    }
                })
            }
            else if(this.url&&!this.linkField) {
                //默认请求地址
                
                self.req();
                // $.ajax({
                //     url: self.url,
                //     type: "GET",
                //     dataType: "json",
                //     data: self.paras,
                //     success: function (data) {
                //         self.list = data;
                //         self.islistReady = true;
                //         if (self.willChose) {
                //             self.choseSome(self.willChose);
                //             self.willChose = '';
                //         }
                //     }
                // })
            }
        }
        else {
            this.list = this.localdata;
        }
    },
    methods: {
        //重置select
        clear: function () { 
            this.list = [];
            this.chosePre = {
                fval: '',
                fcn: ''
            }
        },
        setData: function (data) {
            this.list = data;
            this.islistReady = true;
            if (self.willChose) {
                self.choseSome(self.willChose);
                self.willChose = '';
            }
        },
        req: function (paras,auto) { 
            this.islistReady = false;
            var self = this;
            $.ajax({
                    url: self.url,
                    type: "GET",
                    dataType: "json",
                    data: paras,
                    success: function (data) {
                        self.list = data;
                        self.islistReady = true;
                        if (self.willChose) {
                            self.choseSome(self.willChose,auto);
                            self.willChose = '';
                        }
                        else{
                            
                        }
                    }
                })
        },
        searchData: function (targetData) {
            var val = this.customField.val, cn = this.customField.cn, fcn = [];
            if (typeof targetData == 'string' || typeof targetData == 'number') {
                for (var key in this.list) {
                    if (this.list[key][val] == targetData) {
                        return this.list[key][cn]
                    }
                }
            }
            else if (typeof targetData == 'object') {
                for (var key in this.list) {
                    for (var m = 0; m < this.multi.length; m++) {
                        if (this.list[key][val] == this.multi[m]) {
                            fcn.push(this.list[key][cn]);
                        }
                    }

                }
                return fcn
            }

        },
        //点击
        chose: function (e) {
            var et = e.target, i = 0;
            while (et.tagName != "LI" && i < 10) {
                et = et.parentNode;
                i++;
            }
            if (this.type == 'multi') {
                // e.stopPropagation();
                if (e.target.tagName == "LABEL") return
                var allInput = et.parentNode.getElementsByTagName('INPUT');
                this.multi = [];
                for (var i = 0; i < allInput.length; i++) {
                    if (allInput[i].checked) {
                        this.multi.push(allInput[i].parentNode.getAttribute('data-val'))
                    }
                }
                this.choseSome(this.multi.join(','));
            }
            else if (this.type == 'single') {
                var wantChose = et.getAttribute('data-val');
                var wantChoseData = {
                        fval: wantChose,
                        fcn: this.searchData(wantChose)
                };
                if (this.beforeChose) {
                    this.beforeChose(wantChoseData) && this.choseSome(wantChose);
                }
                else {
                    this.choseSome(wantChose);
                }
                this.toggle();

            }

        },
        //选中
        choseSome: function (codekey,auto) { //auto是否是自动选中
            //如果数据还未就绪，缓存要选择的值
            // console.log(codekey,auto)
            if (!this.islistReady&&codekey !== '' && codekey !== null && codekey !== undefined) {
                this.willChose = codekey;
                // console.log(this.willChose)
                return
            }
            if (codekey !== '' && codekey !== null && codekey !== undefined) {
                if (this.type == 'single') {
                    var targetData;
                    this.chosePre.fval = codekey;
                    this.chosePre.fcn = this.searchData(codekey);
                    !auto&&this.afterChose && this.afterChose(this.chosePre);
                }
                else if (this.type == 'multi') {
                    this.chosePre.fval = codekey;
                    this.multi = codekey.split(',');
                    this.chosePre.fcn = this.searchData(this.multi).join(',');
                    !auto&&this.afterChose && this.afterChose(this.chosePre);
                }

            }
            else {
                this.chosePre.fval = '';
                this.chosePre.fcn = '';
                if (this.type == 'multi') {
                    var allInput = this.$el.querySelector('.multi-input').querySelectorAll('input');
                    for(var i=0;i<allInput.length;i++)
                    {
                        allInput[i].checked = false;
                    }
                }
            }
        },
        //返回选中值
        val: function () {
            return this.chosePre.fval
        },
        //切换
        toggle: function () {
            var allSelect = document.querySelectorAll('.select-group');
            var thisSelect = this.$el;
            for(var i = 0 ; i < allSelect.length; i++)
            {
                if(allSelect[i]!=thisSelect)
                {
                    allSelect[i].querySelector('.dropdown-menu').style.display='none';
                }
            }
            thisSelect = thisSelect.querySelector('.dropdown-menu');
            if(!this.readonly)
            {
                if(thisSelect.style.display =='block')
                {
                    thisSelect.style.display ='none';
                }
                else{
                    thisSelect.style.display ='block';
                    this.spreadEvent&&spreadEvent();
                }
            }
            
        }
    },
    events: {
        'formDataReady': function (msg) {
            if(this.linkField)
            {
                var form={} ;
                for(var i in this.linkField)
                {
                    form[i] = msg[this.linkField[i]];
                }
                this.req(form,true);
            }
            this.autoChose && this.choseSome(msg[this.autoChose],true);
        },
        'formAdd': function () {
            this.choseSome();
            if(this.linkField){
                this.clear();
            }
        },
        //清除选中
        'clear': function () {
            this.choseSome();
        }
    }

});
Vue.component('table-stand', {
    template: '<div class="vue-table">'+
            '<div class="table-par">'+
                '<table class="table-stand">'+
                    '<thead>'+
                        '<tr>'+
                            '<th v-for="item in thead" width="{{item.width}}">{{item.name}}</th>'+
                        '</tr>'+
                    '</thead>'+
                    '<tbody>'+
                        '<tr v-for="item in list.results" v-on:click="req($event,\'single\')" v-on:dblclick="req($event,\'double\')"  data-fid={{mark&&item[mark]||item.fid}}>'+
                            '<template v-for="item2 in thead">'+ 
                                '<template v-if="typeof item2.getter == \'undefined\'">'+ 
                                    '<td title={{item[item2.field]}}>{{item[item2.field]}}</td>'+
                                '</template>'+
                                '<template v-else>'+ 
                                    '<td>{{item2.getter(item[item2.field])}}</td>'+
                                '</template>'+
                            '</template>'+
                        '</tr>'+
                    '</tbody>'+
                '</table>'+
            '</div>'+
            '<div class="loding-con" style="display:none">'+
                '<p class="loding table-loding">'+
                    '<span></span>'+
                    '<span></span>'+
                    '<span></span>'+
                    '<span></span>'+
                    '<span></span>'+
                    '<span></span>'+
                '</p>'+
            '</div>'+
            '<div class="table-control">'+
                '<select name="" id="select-page" v-model="list.pageSize" v-on:change="pgChange(1)">'+
                    '<option v-bind:value="option.value" v-for="option in autoPage">{{option.text }}</option>'+
                '</select>'+
                '<p>'+
                    '<a class="pageUp" v-on:click="pageUp">&lt;</a>'+
                    '<span>'+
                        '<b :class="{\'active\':page.active==1}" v-on:click="pgChange(2)" pagev=1>1</b>'+
                        '<em v-show="page.order==\'head\'||page.order==\'all\'">···</em>'+
                        '<b v-for="item in page.five" :class="{\'active\':item==page.active}" v-on:click="pgChange(2)" pagev={{item}}>'+
                        '{{item}}'+
                        '</b>'+
                        '<em v-show="page.order==\'tail\'||page.order==\'all\'">···</em>'+
                        '<template v-if="page.tp>1">'+
                            '<b :class="{\'active\':page.active==page.tp}" v-on:click="pgChange(2)" pagev={{page.tp}}>'+
                            '{{page.tp}}'+
                            '</b>'+
                        '</template>'+
                    '</span>'+
                    '<a class="pageDown" v-on:click="pageDown">&gt;</a>&nbsp;&nbsp;&nbsp;'+
                    '<span>'+
                        '共&nbsp;{{page.tr}}&nbsp;条'+
                    '</span>'+
                '</p>'+
                '跳转到'+
                '<input type="number" id="" v-model="skipNum" max = "{{page.tp}}" min="0">'+
                '<a href="javascript:;" v-on:click="pgChange(3)"><i class="icon-arrow-right"></i></a>'+
                '<a href="javascript:;" v-on:click="pgChange(1)"><i class="icon-refresh"></i></a>'+
            '</div>'+
        '</div>',
    props: ['list', 'thead', 'skipNum', 'must', 'url','clickFun','dbclickFun','handLoad','mark','search'],
    data: function () {
        return {
            "num": 0,
            "fids": '', //当选选中项目的fid
            "autoPage": '', //自动页数
            "valChose":'',
            "domChose": {}
            // "pageList":page
        }
    },
    ready: function () {
        var self=this;
        if(this.list==undefined||this.list==null)
        {
            this.list = {
                currentPage:1,
                pageSize: 10,
                totalPage: 1
            };
            if(document.documentElement.clientHeight>820)
            {
                this.list.pageSize = 15;
            }
            //todo整合高度
            
        }
        if(!this.search)
        {
            this.search={};
        }
        if(!this.must)
        {
            this.must={
                currentPage:1,
                pageSize: 10,
            };
        }
        if(this.url&&this.url!=''&&!this.handLoad)
        {
            var dataFinal = {};
            for (newPara in this.must) {
                dataFinal[newPara] = this.must[newPara]
            }
            for (newPara in this.search) {
                dataFinal[newPara] = this.search[newPara]
            }
            this.loding(1);
            $.ajax({
                url: self.url,
                type: "GET",
                cache: false,
                dataType: 'JSON',
                data: self.must,
                success: function (data) {
                    self.list = data;
                    self.loding(0);
                    
                },
                error: function () { 
                    self.loding(0);
                 }
            });
        }
        
        //自动更改高度
        setTimeout(function(){
            self.autoHei(); 
        },200)
        window.addEventListener('resize', this.autoHei, false);
    },
    methods: {
        //刷新表格
        refresh: function(){
            this.pgChange(4);
        },
        clearSearch: function () {  
            this.search = {};
        },
        setSearch: function (data) {  
            for(var i in data)
            {
                this.search[i]=data[i]
            }
        },
        //更改页码相关,ty=1刷新，ty=2更改页码，ty=3跳转到某页，ty = 4 搜索
        pgChange: function (ty) {
            if(this.list==undefined||this.list==null)
            {
                this.list = {
                    currentPage:1,
                    pageSize: 15,
                    totalPage: 1
                };
            }
            this.num++;
            var num2 = this.num;
            var self = this;
            var dataFinal = {};
            //增加必须和搜索参数
            for (newPara in this.must) {
                dataFinal[newPara] = this.must[newPara]
            }
            for (newPara in this.search) {
                dataFinal[newPara] = this.search[newPara]
            }
            dataFinal.pageSize = self.list.pageSize;
            dataFinal.currentPage = ty == 1 && self.list.currentPage || ty == 2 && event.target.getAttribute('pagev') || ty == 3 && self.skipNum||ty == 4 && 1;
            if(this.list.totalPage == 0)
            {
                this.list.totalPage = 1;
            }
            if(dataFinal.currentPage<=0||dataFinal.currentPage>this.list.totalPage)
            {
                warnFull('超出范围！','red');
                return false
            }
            this.loding(1);
            $.ajax({
                url: self.url,
                type: "GET",
                cache: false,
                dataType: 'JSON',
                data: dataFinal,
                success: function (data) {
                    if (num2 == self.num) {
                        self.list = data;
                        self.loding(0);
                        self.fids='';
                        self.valChose='';
                    }
                },
                error: function () { 
                    self.loding(0);
                 }
            });
        },
        //点击active,获取fid
        req: function (e,clickType) {
            var trs;
            var self = this;
            if (e.target.tagName == 'TD') {
                this.fids = e.target.parentNode.getAttribute('data-fid');
                trs = e.target.parentNode.parentNode.getElementsByTagName('TR');
                for (var i = 0; i < trs.length; i++) {
                    trs[i].className = '';
                }
                this.domChose = e.target.parentNode;
                e.target.parentNode.className = 'active';
            }
            else if (e.target.tagName == 'TR') {
                this.fids = e.target.getAttribute('data-fid');
                trs = e.target.parentNode.getElementsBytagName('TR');
                for (var i = 0; i < trs.length; i++) {
                    trs[i].className = '';
                }
                this.domChose = e.target;
                e.target.className = 'active';
            }
            var item = this.searchData(this.list.results,this.fids);
            this.valChose = item; //todo变量名valchose
            if(clickType == 'single')
            {
                item && this.clickFun && this.clickFun(item)

            } else{
               item && this.dbclickFun && this.dbclickFun(item);

            }
            
            // rightInfo.req(fids);
        },
        //更改Table高度及确定可选择的条数
        autoHei: function () {
            // var $content = document.getElementsByClassName('content-list')[0];
            var $content = this.$el.parentNode.parentNode;
            if(!$content) {
                return
            }
            var top = $content.getElementsByClassName('cl-head')[0].offsetHeight;
            var hei = this.$el.offsetHeight - top;
            $content.getElementsByClassName('table-con')[0].style.top = top + 'px';
            // var hei = this.$el.offsetHeight;
            var selectPage = [];
            var i = 5;
            do {
                selectPage.push({
                    "value": i,
                    "text": i
                });
                i = i + 5
            }
            while (i * 35 <= hei)
            if (this.list&&this.list.pageSize > selectPage[selectPage.length - 1].value) {
                this.list.pageSize = selectPage[selectPage.length - 1].value;
            }
            this.autoPage = selectPage;
        },
        setData: function(data){
            this.list = data;
        },
        //寻找并返回数据
        searchData: function(datas,fids) {
            if(!this.mark)
            {
                for (var i = 0;i < datas.length;i++)
                {
                    if(fids == datas[i].fid){
                        return datas[i]
                    }
                }
            }
            else{
                for (var i = 0;i < datas.length;i++)
                {
                    if(fids == datas[i][this.mark]){
                        return datas[i]
                    }
                }
            }
            
        },
        //上一条
        prev: function(){
            var allTr = this.$el.querySelector('TBODY').querySelectorAll('TR');
            if(this.valChose)
            { 
                for( var  i = 0 ; i < allTr.length ; i++)
                {
                    if(allTr[i].className.indexOf('active')!=-1)
                    {
                        if(i == 0)
                        {
                            // this.pageUp();
                            // warnTop('已经到顶了');
                            return false
                        }else{
                            allTr[i].className = '';
                            allTr[i-1].className = 'active';
                            this.fids = allTr[i-1].getAttribute('data-fid');
                            this.valChose = this.searchData(this.list.results,this.fids);
                            return this.valChose;
                        }
                    }
                }
            }
            else{
                allTr[allTr.length-1].className = 'active';
                this.fids = allTr[allTr.length-1].getAttribute('data-fid');
                this.valChose = this.searchData(this.list.results,this.fids);
                return this.valChose;
            }
        },
        next: function(){
            var allTr = this.$el.querySelector('TBODY').querySelectorAll('TR');
            if(this.valChose)
            { 
                for( var  i = 0 ; i < allTr.length ; i++)
                {
                    if(allTr[i].className.indexOf('active')!=-1)
                    {
                        if(i == allTr.length-1)
                        {
                            // this.pageDown();
                            // warnTop('已经到底了');
                            return false
                        }else{
                            allTr[i].className='';
                            allTr[i+1].className='active';
                            this.fids = allTr[i+1].getAttribute('data-fid');
                            this.valChose = this.searchData(this.list.results,this.fids);
                            return this.valChose;
                        }
                    }
                }
            }
            else{
                allTr[0].className = 'active';
                this.fids = allTr[0].getAttribute('data-fid');
                this.valChose = this.searchData(this.list.results,this.fids);
                return this.valChose;
            }

        },
        pageDown: function(){
            if(this.list.currentPage<this.list.totalPage)
            {
                this.list.currentPage++;
                this.pgChange(1);
            }
        },
        pageUp: function(){
            if(this.list.currentPage > 1)
            {
                this.list.currentPage--;
                this.pgChange(1);
            }

        },
        loding: function (para) { 
            if(para)
            {
                this.$el.querySelector('.loding-con').style.display='block';
            }
            else
            {
                this.$el.querySelector('.loding-con').style.display='none';
            }
         },


    },
    computed: {
        //处理页码部分的数据（从表格数据里）
        page: function () {
            var pageObj = {
                "tp": this.list.totalPage,//总页数 
                "tr": this.list.totalRecord,//总页数 
                "active": this.list.currentPage,//目前选中
                "five": [],//中间五个数字不包括头尾
                "order": '',//省略号位置 head tail none all
                "ps": this.list.pageSize//每页的条目数量
            };
            if (this.list.totalPage <= 7) {
                pageObj.order = 'none';
                for (var i = 2; i < this.list.totalPage; i++) {
                    pageObj.five.push(i);
                }
            }
            else {
                if (pageObj.active - 3 > 1 && pageObj.active + 3 < pageObj.tp) {
                    pageObj.order = 'all';
                    for (var i = pageObj.active - 2; i <= pageObj.active + 2; i++) {
                        pageObj.five.push(i);
                    }
                }
                else if (pageObj.active - 3 > 1 && pageObj.active + 3 >= pageObj.tp) {
                    pageObj.order = 'head';
                    for (var i = pageObj.tp - 5; i < pageObj.tp; i++) {
                        pageObj.five.push(i);
                    }
                }
                else if (pageObj.active - 3 <= 1 && pageObj.active + 3 < pageObj.tp) {
                    pageObj.order = 'tail';
                    for (var i = 2; i <= 6; i++) {
                        pageObj.five.push(i);
                    }
                }
            }
            return pageObj
        }
    },
    events: {
    }
});
Vue.component('upload', {
    template: '<div class="drop-upload" style="display:none">'+ 
            ' <template v-if="form"> '+
                '<div class="form-panel">'+
                    '<p class="title-switch">'+
                        '<span>{{formTitle||"请先选择过滤条件"}}</span>'+
                    '</p>'+
                    '<form>'+
                    '<template v-for="item in form">'+
                            '<template v-if="item.type==\'text\'||item.type==\'number\'||item.type==\'file\'||item.type==\'password\'||item.type==\'email\'">'+
                    '            <div :class="[\'form-group\',item.validate&&item.validate.required&&\'required\',item.roasnm&&\'roasnm\']">'+
                    '                <label>{{item.name}}{{item.ps}}</label>'+
                    '                <input type="{{item.type}}"  id="{{item.id}}" name="{{item.field}}" class="form-control" accept="{{item.accept}}" checked="{{item.checked}}" v-model="formData[item.field]" max="{{item.max}}" min="{{item.min}}" maxlength="{{item.maxlength}}" multiple="{{item.multiple}}" v-bind:readonly="item.readonly==true&&readAdd||item.readonly==\'ever\'&&true||readonly" v-on:click="item.operaFun">'+
                    '            </div>'+
                    '        </template>'+
                    '        <template v-if="item.type==\'date\'">'+
                                '<div :class=[\'form-group\',\'roasnm\',\'form-group-date\',item.validate&&item.validate.required&&\'required\']>'+
                                    '<label>{{item.name}}</label>'+
                    '                <input type="text"  id="{{item.id}}" :readonly="item.readonly==true&&readAdd||item.readonly==\'ever\'&&true||readonly" class="form-control" name="{{item.field}}"  v-model="formData[item.field]">'+
                                '</div>'+
                    '        </template>'+
                    '        <template v-if="item.type==\'radio\'">'+
                    '            <div :class="[\'form-group\',\'form-group-long\',item.validate&&item.validate.required&&\'required\']">'+
                    '                <label>{{item.name}}</label>'+
                    '                <template v-for="item2 in item.radio">'+
                    '                    <span class="form-chose">'+
                    '                        <input type="radio" name="{{item.field}}" id="{{item2.id}}" value="{{item2.value}}" v-model="formData[item.field]" :disabled="item2.disabled==true&&readAdd||item2.disabled==\'ever\'&&true||disabled">'+
                    '                        <label for="{{item2.id}}">{{item2.name}}</label>'+
                    '                    </span>'+
                    '                </template>'+
                    '            </div>'+
                    '        </template>'+
                    '        <template v-if="item.type==\'checkbox\'">'+
                    '            <div :class="[\'form-group\',\'form-group-long\',item.validate&&item.validate.required&&\'required\']">'+
                    '                <label>{{item.name}}</label>'+
                    '                <template v-for="item2 in item.checkbox">'+
                    '                    <span class="form-chose">'+
                    '                        <input type="checkbox" name="{{item.field}}" id="{{item2.id}}" value="{{item2.value}}" v-model="formData[item.field]"  :disabled="item2.disabled==true&&readAdd||item2.disabled==\'ever\'&&true||disabled">'+
                    '                        <label for="{{item2.id}}">{{item2.name}}</label>'+
                    '                    </span>'+
                    '                </template>'+
                    '            </div>'+
                    '        </template>'+
                    '        <template v-if="item.type==\'select\'">'+
                                '<div :class="[\'form-group\',item.validate&&item.validate.required&&\'required\']">'+
                                    '<label>{{item.name}}</label>'+
                                    '<select-stand :id="item.id" :name="item.field" :info-type="item.select.infoTypes" :type="item.select.type" :readonly="item.readonly==true&&readAdd||item.readonly==\'ever\'&&true||readonly" :auto-chose="item.field" :auto-chose-cn="item.select.fieldCn" :localdata="item.select.localdata" :url="item.select.url" :after-chose="item.select.afterChose" :before-chose="item.select.beforeChose" :custom-field="item.select.customField" :spread-event="item.select.spreadEvent" :paras="item.select.paras" :link-field="item.select.linkField">'+
                                    '</select-stand>'+
                                '</div>'+
                    '        </template>'+
                        '</template>'+
                        '</form>'+
                '    </div>'+
                '</template>'+
    '           <div >'+
// '               <div class="drop-file-block">'+
//     '                可以将文件拖拽到此处'+
// '               </div>'+
    '            <label for="choseFile" class="chose-file-block">将文件拖拽到此处，或者点此选择文件</label>'+
                '<input type="file" class="chose-file-input" v-on:change="readFile($event)" :multiple="type==\'multi\'" :accept="fileType.join(\',\')" id="choseFile">'+
                
                '<a href="javascript:void(0);" v-on:click="uploadFile" class="btn btn-stand btn-upload">上传</a>'+
                '<a href="javascript:;" class="item-btn item-btn2 upload-close"><i class="icon-remove" v-on:click="close"></i></a>'+
                '<template v-if="progressBar">'+
                    '<p class="file-upload">'+
                        '<i class="icon-paper-clip"></i>'+
                        '<span class="file-name">{{filesName}}</span>'+
                        // '<a href="javascript:;">x</a>'+
                        '<span class="percentage"><b>{{size}}{{unit}}</b> / <b>{{progress}}</b></span>'+
                        '<em class="progress" :style="{ width: progress}"></em>'+
                    '</p>'+
                '<template/>'+
'        </div>'+
'    </div>',
    props: ['type','url','fileType','successFun','form'],//type单选多选
    data: function () {
        return {
            files:[],
            filesName: [], 
            formData: {}, 
            selectGroup: [], 
            progress: '0%', 
            status: false, //是否在上传中
            unit:'', //大小单位
            size: '', //大小
            progressBar: false, //进度条的状态
        }
    },
    ready: function () {
        var self = this;
        this.valiSet={
            debug: true,
            onsubmit: false,
            onkeyup:false,
            errorElement: 'p',
            errorClass:'form-wrong',
            rules: {

            }
        };
        //初始化form
        if(this.form)
        {
            var form = this.form;
            for(var i=0;i< this.form.length;i++)
            {
                Vue.set(this.formData,this.form[i].field,'');
                //select
                if(form[i].type=='select')
                {
                    this.selectGroup.push(i)
                }
                //date
                else if(form[i].type=='date'){
                    // console.log(0)
                    // laydate(form[i].date);
                    if(!form[i].id) console.log('date组件需要配置id')
                    $('#'+form[i].id).datetimepicker(form[i].date);

                }
                if(form[i].validate)
                {
                    this.valiSet.rules[form[i].field] = form[i].validate;
                }
            }
            this.validateFun = $(this.$el.querySelector('form')).validate(this.valiSet);
        }
        //默认的文件类型是excel
        if(!this.fileType){
            this.fileType=['application/vnd.ms-excel.sheet.binary.macroEnabled.12','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.ms-excel'];
        }
        //添加拖放事件
        // var $drop = this.$el.querySelector('.drop-file-block');
        var $drop = this.$el.querySelector('.chose-file-block');
        
        $drop.addEventListener('dragover',function(e){
            //阻止默认行为才能触发目标元素的drop事件
            e.preventDefault();
        },false)
        
        $drop.addEventListener('dragenter',function(e){
            $drop.className = 'chose-file-block hover';
        },false)
        $drop.addEventListener('dragleave',function(e){
            $drop.className = 'chose-file-block';
        },false)
        $drop.addEventListener('drop',function(e){
            e.preventDefault();
            $drop.className = 'chose-file-block';
            var files = e.dataTransfer.files;
            if((!self.type||self.type=="single")&&files.length>1) {
                warnFull('每次只能接受一个文件！');
                return
            }
            for(var i = 0 ; i< files.length; i++)
            {
                for(var m = 0; m < self.fileType.length;m++)
                {
                    if(files[i].type==self.fileType[m])
                    {
                        break;
                    }
                    if(m==self.fileType.length-1)
                    {
                        warnFull('文件 \"'+files[i].name+'\" 格式有误','red');
                        return
                    }
                }
                if(i == files.length-1)
                {
                    self.files = e.dataTransfer.files;
                    self.$el.querySelector('#choseFile').value='';
                    // self.$el.querySelector('.chose-file-block').innerHTML='点击选择文件';
                    $drop.innerHTML = files.length==1&&files[0].name || (files.length+'个文件')
                }
                
            }
        },false)
    },
    methods: {
        open: function () { 
            this.$el.style.display='block';
        },
        close: function () {  
            this.$el.style.display='none';
            this.reset();
        },
        reset: function(){
            this.files=[];
            this.filesName = '';
            this.$el.querySelector('.chose-file-block').innerHTML = "将文件拖拽到此处，或者点此选择文件";
            this.$el.querySelector('#choseFile').value='';
            this.status = false;
        },
        readFile: function (e) {  
            this.files = e.target.files;
            this.$el.querySelector('.chose-file-block').innerHTML = e.target.files.length==1&&e.target.files[0].name || (e.target.files.length + '个文件');
            // this.$el.querySelector('.drop-file-block').innerHTML= '将文件拖拽到此处';
            // this.uploadFile(file);
        },
        uploadFile: function (files) {
            if(this.form)
            {
                if(!this.validateFun.form()) {
                    return false;
                }
            }
            
            var self = this;
            //获取子组件的值
            for(var i=0;i<self.selectGroup.length;i++)
            {
                this.formData[this.form[this.selectGroup[i]].field] = this.$children[i].val();
            } 
            if(!this.files.length) {
                warnFull('请先选择文件')
                return;
            }
            var self = this; 
            //默认单个上传
            if(!self.type||self.type=="single")
            {
                if(this.status) return
                var filesName = this.files[0].name;
                for(var i = 0 ; i< this.fileType.length; i++)
                {
                    if(this.files[0].type==this.fileType[i]) break
                }

                if(i==this.fileType.length) return false;//文件格式不符
                //新formData,添加文件及条件
                var newFormData = new FormData();
                newFormData.append('file',this.files[0]);
                for(var i in this.formData)
                {
                    newFormData.append(i,this.formData[i]);
                }
                //计算大小及单位
                var size = this.files[0].size;
                var sizeTs = size/1024;
                var unit = 'KB';
                if(sizeTs>1000)
                {
                    sizeTs = size/1024;
                    unit = 'MB';
                }
                sizeTs = sizeTs.toFixed(2);
                self.size = sizeTs;
                self.unit = unit;

                //请求
                var xhr = new XMLHttpRequest;
                xhr.open('POST',self.url,true);
                // xhr.setRequestHeader("Content-Type","multipart/form-data;charset=utf-8");
                xhr.upload.addEventListener("progress", function(e) {  
                    var progress = e.loaded/size*100;
                    if(progress>=100)
                    {
                        progress = 100;
                        // self.filesName = '';
                        // warnFull('上传成功！后台处理数据中');
                        // self.$el.querySelector('.chose-file-block').innerHTML= '将文件拖拽到此处，或者点此选择文件';
                        // self.$el.querySelector('#choseFile').value='';
                        // self.files = [];
                        // self.successFun&&self.successFun();
                    } 
                    self.progress = progress +'%';
                }, false); 
            //     xhr.timeout = 5000;
            //     xhr.ontimeout = function(event){
            //         warnFull('请求超时！','red');
            // 　　};
                // xhr.onload = function(e) {
                //     self.progressBar = false;
                //     if (xhr.status == 200) {
                //         self.$el.querySelector('.drop-file-block').innerHTML= '将文件拖拽到此处';
                //         self.$el.querySelector('#choseFile').value='';
                //         self.$el.querySelector('.chose-file-block').innerHTML='点击选择文件';
                //         self.files = [];
                //         self.successFun&&self.successFun(xhr);
                //     } else {
                //         warnFull(JSON.parse(xhr.responseText).message,'red')
                //     }
                // };

                xhr.onreadystatechange = function(data){
                    if(xhr.readyState==2)
                    {
                        self.filesName = filesName;
                        self.progressBar = true;
                        this.status = true;
                    }
                    else if(xhr.readyState==4 )
                    {

                        this.status = false;
                        if(xhr.status == 200)
                        {
                            self.reset();
                            self.progressBar = false;
                            warnTop('上传成功！后台处理数据中');
                            self.successFun&&self.successFun(xhr);
                        }else {
                            if(xhr.responseText)
                            {
                                warnFull(JSON.parse(xhr.responseText).message,'red');
                                self.progressBar = false;
                                self.progress = 0;

                            }

                        }
                    } 
                    // if(xhr.readyState==4&&xhr.status>=200&&xhr.status<300)
                    // {
                    //     self.progressBar = false;
                    // }
                    // else if(xhr.readyState==4&&xhr.status>300)
                    // {
                    //     self.progressBar = false;
                    //     warnFull(JSON.parse(xhr.responseText).message,'red');
                    // }
                };
                xhr.send(newFormData);
            }
            else if(self.type=="multi"){
                //todo多选上传
            }
        }
    }

});
// ztree面板，相关的数据逻辑手动写，暂无法自动
Vue.component('ztree-panel',{
    template: '<div class="content-right content-right-organ">'+
                    '<div class="class-cr clearfix">'+
                        '<a class="item-btn hover">'+
                            '<i class="icon-pencil"></i>'+
                            '<span class="operName1">{{title}}</span>'+
                        '</a>'+
                        '<p class="item-list2">'+
                            '<a href="javascript:;" class="item-btn item-btn1" v-on:click="saveMess()"><i class="icon-ok"></i></a>'+
                            '<a href="javascript:;" class="item-btn item-btn2" v-on:click="close()"><i class="icon-remove"></i></a>'+
                        '</p>'+
                    '</div>'+
                    '<div class="content-con">'+
                        '<div class="title-list-fold">'+
                            '<p class="title-switch" href="javascript:;">'+
                                '<span>{{title}}</span>'+
                            '</p>'+
                            '<div id="{{treeId}}" class="ztree">'+
                            '</div>'+
                        '</div>'+
                        '<div class="loding-con" style="display:none">'+
                            '<p class="loding"><span></span><span></span><span></span><span></span><span></span><span></span></p>'+
                        '</div>'+
                    '</div>'+
                '</div>',
    props:['ztreeSet','title','treeId','saveFun','closeFun','linkCN','linkValue'],
    //todo 赋值
    data: function(){
        return {
            statu: 'close',
            messSource: false, //是否是广播的事件的源头
            chosePre: {
                val: '',
                cn: ''
            }
        }
    },
    ready: function(){
        var setting = this.ztreeSet;
        var self = this;
        $.fn.zTree.init($("#"+self.treeId), self.ztreeSet);
    },
    methods: {
        open: function() {
            var self = this;
            this.$el.style.right = '0px';
            this.messSource = true;
            this.$parent.$broadcast('ztree-panel', 'open');
            this.statu ='open';
        },
        close: function() {
            var self = this;
            this.$parent.$broadcast('ztree-panel', 'close');            
            this.$el.style.right = '-390px';
            this.statu ='close';
            this.clear();
        },
        clear: function(){
            this.chosePre = {
                val: '',
                cn: ''
            }
        },
        check: function (id) {
            var filter,isMulti;
            this.open();
            var treeObj = $.fn.zTree.getZTreeObj(this.treeId);
            if(this.ztreeSet.check)
            {
                isMulti = this.ztreeSet.check.enable ;
            }
            else{
                isMulti = false
            }
            treeObj.cancelSelectedNode();
            //判断是否自定义了搜索字段和是都多选
            if(typeof id == 'object')
            {
                for(var i in id)
                {
                    id[i] =  String(id[i]);
                    id[i] = id[i].split(',');
                    
                    for( var m = 0 ; m < id[i].length; m++ )
                    {
                        filter = function (node) {
                            return (node[i] == id[i][m]);
                        };
                        node = treeObj.getNodesByFilter(filter, true);
                        if(!isMulti)
                        {
                            node && treeObj.selectNode(node);
                        }
                        else{
                            node && treeObj.checkNode(node, true);
                        }
                        
                    }
                    
                }
                
            }
            else{
                id =  String(id);
                id = id.split(',');
                for( var m = 0 ; m < id.length; m++ )
                {
                    filter = function (node) {
                        return (node.fid == id[m]);
                    };
                    node = treeObj.getNodesByFilter(filter, true);
                    if(!isMulti)
                    {
                        node && treeObj.selectNode(node);
                    }
                    else{
                        node && treeObj.checkNode(nodes, true);
                    }
                    
                }
            }
            // debugger
            // if(filter)
            // {
            //     if(!this.ztreeSet.check.enable)
            //     {
            //         var node = treeObj.getNodesByFilter(filter, true);
            //             node && treeObj.selectNode(node);
            //     }
            //     else{
            //         if(typeof id == "object")
            //         {
            //             var node
            //             for(var m = 0;m<id.length;m++){
            //                 filter = function (node) {
            //                     return (node.fid == id[m]);
            //                 };
            //                 node = treeObj.getNodesByFilter(filter, true);
            //                 node && treeObj.checkNode(nodes, true);
            //             }
            //         }
            //     }
            // }
        },
        saveMess: function(){
            this.saveFun();
        }
    },
    events: {
        'form-panel':function(msg){
            if(msg=='close')
            {
                this.$el.style.right = '-390px';
                this.statu ='close';
            }
        },
        'ztree-panel':function(msg){
            if(msg=='open')
            {
                if(!this.messSource)
                {
                    this.$el.style.right = '-390px';
                    this.statu ='close';
                }
                else{
                    this.messSource=false;
                }
            }
        }
    }
});