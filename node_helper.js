/**
 * MMM-Netatmo node helper
 */
const NodeHelper = require('node_helper');
const request = require('request');

module.exports = NodeHelper.create({

    socketNotificationReceived: function(notification, payload) {
        getDesign: function (design) {
            const that = this;
            const formatter = this.formatter;
            const translator = this.translate;
            return {
                classic: (function (formatter, translator, that) {
                    return {
                        render: function (device) {
                            const sResult = $('<div/>').addClass('modules').addClass(that.config.design);
                            if (that.config.horizontal)
                                sResult.addClass('horizontal');
                            const aOrderedModuleList = that.config.moduleOrder && that.config.moduleOrder.length > 0 ?
                                that.config.moduleOrder :
                                null;
                            if (aOrderedModuleList) {
                                for (const moduleName of aOrderedModuleList) {
                                    if (device.module_name === moduleName) {
                                        sResult.append(this.renderModule(device));
                                    } else {
                                        for (const module of device.modules) {
                                            if (module.module_name === moduleName) {
                                                sResult.append(this.renderModule(module));
                                                break;
                                            }
                                        }
                                    }
                                }
                            } else {
                                // render station data (main station)
                                sResult.append(this.renderModule(device));
                                // render module data (connected modules)
                                for (let cnt = 0; cnt < device.modules.length; cnt++) {
                                    sResult.append(this.renderModule(device.modules[cnt]));
                                }
                            }
                            return sResult;
                        },
                        renderModule: function (oModule) {
                            return $('<div/>').addClass('module').append(
                                $('<div>').addClass('data').append(this.renderSensorData(oModule))
                            ).append(
                                $('<div>').addClass('name small').append(oModule.module_name)
                            );
                        },
                        renderSensorData: function (oModule) {
                            let dataType;
                            const sResult = $('<table/>');
                            const aDataTypeList = that.config.dataOrder && that.config.dataOrder.length > 0 ?
                                that.config.dataOrder :
                                oModule.data_type;
                            for (dataType of aDataTypeList) {
                                if ($.inArray(dataType, oModule.data_type) > -1) {
                                    sResult.append(
                                        this.renderData(
                                            formatter.clazz(dataType),
                                            dataType,
                                            oModule.dashboard_data[dataType])
                                    );
                                }
                            }
                            if (oModule.battery_percent) {
                                sResult.append(this.renderData(formatter.clazz(dataType), 'Battery', oModule.battery_percent));
                            }
                            return sResult;
                        },
                        renderData: function (clazz, dataType, value) {
                            return $('<tr/>').append(
                                $('<td/>').addClass('small').append(
                                    translator.bind(that)(dataType.toUpperCase())
                                )
                            ).append(
                                $('<td/>').addClass('small value').append(
                                    formatter.value(dataType, value)
                                )
                            );
                        }
                    };
                })(formatter, translator, that),
                bubbles: (function (formatter, translator, that) {
                    return {
                        moduleType: {
                            MAIN: "NAMain",
                            INDOOR: "NAModule4",
                            OUTDOOR: "NAModule1",
                            RAIN: "NAModule3",
                            WIND: "NAModule2"
                        },
                        render: function (device) {
                            const sResult = $('<div/>').addClass('modules').addClass(that.config.design);
                            const aOrderedModuleList = that.config.moduleOrder && that.config.moduleOrder.length > 0 ?
                                that.config.moduleOrder :
                                null;

                            if (aOrderedModuleList) {
                                for (const moduleName of aOrderedModuleList) {
                                    if (device.module_name === moduleName) {
                                        sResult.append(this.module(device));
                                    } else {
                                        for (const module of device.modules) {
                                            if (module.module_name === moduleName) {
                                                sResult.append(this.module(module));
                                                break;
                                            }
                                        }
                                    }
                                }
                            } else {
                                // render station data (main station)
                                sResult.append(this.module(device));
                                // render module data (connected modules)
                                for (let cnt = 0; cnt < device.modules.length; cnt++) {
                                    sResult.append(this.module(device.modules[cnt]));
                                }
                            }
                            return sResult;
                        },
                        module: function (module) {
                            const result = $('<div/>').addClass('module').append(
                                $('<div/>').addClass('name small').append(module.module_name)
                            ).append(
                                $('<div/>').append(
                                    $('<table/>').addClass('').append(
                                        $('<tr/>').append(
                                            this.primary(module)
                                        ).append(
                                            this.secondary(module)
                                        ).append(
                                            this.data(module)
                                        )))
                            );
                            return result[0].outerHTML;
                        },
                        primary: function (module) {
                            const result = $('<td/>').addClass('primary');
                            let type;
                            let value;
                            switch (module.type) {
                                case this.moduleType.MAIN:
                                case this.moduleType.INDOOR:
                                case this.moduleType.OUTDOOR:
                                    type = 'Temperature';
                                    value = module.dashboard_data[type];
                                    $('<div/>').addClass(type).append(
                                        $('<div/>').addClass('large light bright').append(formatter.value(type, value))
                                    ).appendTo(result);
                                    break;
                                case this.moduleType.WIND:
                                    type = 'WindStrength';
                                    value = module.dashboard_data[type];
                                    $('<div/>').addClass(type).append(
                                        $('<div/>').addClass('large light bright').append(value)
                                    ).append(
                                        $('<div/>').addClass('xsmall').append('m/s')
                                    ).appendTo(result);
                                    break;
                                case this.moduleType.RAIN:
                                    type = 'Rain';
                                    value = module.dashboard_data[type];
                                    $('<div/>').addClass(type).append(
                                        $('<div/>').addClass('large light bright').append(value)
                                    ).append(
                                        $('<div/>').addClass('xsmall').append('mm/h')
                                    ).appendTo(result);
                                    break;
                                default:
                            }
                            return result;
                        },
                        secondary: function (module) {
                            const result = $('<td/>').addClass('secondary');
                            switch (module.type) {
                                case this.moduleType.MAIN:
                                case this.moduleType.INDOOR:
                                    let type = 'CO2';
                                    let value = module.dashboard_data[type];
                                    const status = value > 1600 ? 'bad' : value > 800 ? 'average' : 'good';

                                    $('<div/>').addClass(type).append(
                                        $('<div/>').addClass('visual').addClass(status)
                                    ).append(
                                        $('<div/>').addClass('small value').append(formatter.value(type, value))
                                    ).appendTo(result);
                                    break;
                                case this.moduleType.WIND:
                                    type = 'WindAngle';
                                    value = module.dashboard_data[type];

                                    $('<div/>').addClass(type).append(
                                        $('<div/>').addClass('visual xlarge wi wi-direction-up').css('transform', 'rotate(' + value + 'deg)')
                                    ).append(
                                        $('<div/>').addClass('small value').append(formatter.value(type, value))
                                    ).appendTo(result);
                                    break;
                                case this.moduleType.OUTDOOR:
                                case this.moduleType.RAIN:
                                default:
                                    break;
                            }
                            return result;
                        },
                        data: function (module) {
                            const result = $('<td/>').addClass('data');
                            switch (module.type) {
                                case this.moduleType.MAIN:
                                    this.addTemperatureTrend(result, module);
                                    this.addHumidity(result, module);
                                    this.addPressure(result, module);
                                    this.addPressureTrend(result, module);
                                    this.addNoise(result, module);
                                    this.addWiFi(result, module);
                                    //result += this.addData('max_temp', module.dashboard_data['max_temp']);
                                    //result += this.addData('min_temp', module.dashboard_data['min_temp']);
                                    break;
                                case this.moduleType.INDOOR:
                                    this.addTemperatureTrend(result, module);
                                    this.addHumidity(result, module);
                                    this.addBattery(result, module);
                                    this.addRadio(result, module);
                                    this.addLastSeen(result, module);
                                    break;
                                case this.moduleType.OUTDOOR:
                                    this.addTemperatureTrend(result, module);
                                    this.addHumidity(result, module);
                                    this.addBattery(result, module);
                                    this.addRadio(result, module);
                                    this.addLastSeen(result, module);
                                    break;
                                case this.moduleType.WIND:
                                    this.addData(result, 'GustStrength', module.dashboard_data['GustStrength']);
                                    this.addData(result, 'GustAngle', module.dashboard_data['GustAngle']);
                                    this.addBattery(result, module);
                                    this.addRadio(result, module);
                                    this.addLastSeen(result, module);
                                    break;
                                case this.moduleType.RAIN:
                                    this.addData(result, 'sum_rain_1', module.dashboard_data['sum_rain_1']);
                                    this.addData(result, 'sum_rain_24', module.dashboard_data['sum_rain_24']);
                                    this.addBattery(result, module);
                                    this.addRadio(result, module);
                                    this.addLastSeen(result, module);
                                    break;
                                default:
                                    break;
                            }
                            return result;
                        },
                        addTemperatureTrend: function (parent, module) {
                            let value = module.dashboard_data['temp_trend'];
                            if (!value)
                                value = 'UNDEFINED'
                            if (that.config.showTrend)
                                this.addData(parent, 'temp_trend', translator.bind(that)(value.toUpperCase()));
                        },
                        addPressure: function (parent, module) {
                            return this.addData(parent, 'Pressure', module.dashboard_data['Pressure']);
                        },
                        addPressureTrend: function (parent, module) {
                            let value = module.dashboard_data['pressure_trend'];
                            if (!value)
                                value = 'UNDEFINED';
                            if (that.config.showTrend)
                                this.addData(parent, 'pressure_trend', translator.bind(that)(value.toUpperCase()));
                        },
                        addHumidity: function (parent, module) {
                            return this.addData(parent, 'Humidity', module.dashboard_data['Humidity']);
                        },
                        addNoise: function (parent, module) {
                            return this.addData(parent, 'Noise', module.dashboard_data['Noise']);
                        },
                        addBattery: function (parent, module) {
                            if (that.config.showBattery)
                                this.addData(parent, 'Battery', module.battery_percent);
                        },
                        addRadio: function (parent, module) {
                            if (that.config.showRadio)
                                this.addData(parent, 'Radio', module.rf_status);
                        },
                        addWiFi: function (parent, module) {
                            if (that.config.showWiFi)
                                this.addData(parent, 'WiFi', module.wifi_status);
                        },
                        addLastSeen: function (parent, module) {
                            const duration = Date.now() / 1000 - module.last_message;
                            if (that.config.showLastMessage && duration > that.config.lastMessageThreshold) {
                                $('<div/>')
                                    .addClass('small flash')
                                    .append(
                                        translator.bind(that)("LAST_MESSAGE")
                                        + ': '
                                        + moment.unix(module.last_message).fromNow()
                                    )
                                    .appendTo(parent);
                            }
                        },
                        addData: function (parent, type, value) {
                            return $('<div/>')
                                .addClass('small')
                                .append(
                                    translator.bind(that)(type.toUpperCase())
                                    + ': '
                                    + formatter.value(type, value)
                                )
                                .appendTo(parent);
                        }
                    };
                })(formatter, translator, that)
            }[design]
        }
    },
});