$(document).ready(function () {

    let performance_api = '/get_white_paper_data';

    Array.prototype.contains = function (needle) {
        for (i in this) {
            if (this[i] == needle) return true;
        }
        return false;
    };

    Array.prototype.clone = function () {
        return this.slice(0);
    };

    String.prototype.hashCode = function () {
        var hash = 0;
        for (var i = 0; i < this.length; i++) {
            var character = this.charCodeAt(i);
            hash = ((hash << 5) - hash) + character;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    };

    String.prototype.replaceAll = function (search, replacement) {
        var target = this;
        return target.split(search).join(replacement);
    };

    const sleep = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    };

    /**
     * jQuery ajax retry
     * */
    $.ajax = (($oldAjax) => {
        // on fail, retry by creating a new Ajax deferred
        function check(a, b, c) {
            var shouldRetry = b != 'success' && b != 'parsererror';
            if (shouldRetry && --this.retries > 0)
                setTimeout(() => {
                    $.ajax(this)
                }, this.retryInterval || 100);
        }

        return settings => $oldAjax(settings).always(check)
    })($.ajax);

    function add_metric_listener(metric_id) {
        $('#' + metric_id).change(function () {
            $.getJSON('modify_pm_publish', {
                id: metric_id,
                value: ($(this).is(':checked') ? 'T' : 'F')
            }).done(function (data) {
                save_signal_text = $('#' + metric_id).next();
                save_signal_text.fadeIn();
                save_signal_text.fadeOut();
                console.log(data);
            }).fail(function () {
                alert('Failed to set metric. Please retry');
            })
        });
    }

    function load_metric_by_feature(branch, feature_list, edit_mode) {
        if (feature_list.length == 0) {
            $('#branch_selector').prop('disabled', false);
            return;
        } else {
            $('#branch_selector').prop('disabled', true);
        }
        feature = feature_list[0];
        feature_list.splice(0, 1);

        $.getJSON(performance_api, {
            'branch': branch,
            'feature': feature
        }).done(function (data) {
            console.log(data);
            construct_tables(data, edit_mode);
            load_metric_by_feature(branch, feature_list, edit_mode);
        }).fail(function () {
            alert('Failed to get metrics for branch ' +
                branch + ' feature ' + feature + '. Please REFRESH!');
        })
    }

    function is_valid_config(metrics) {
        is_valid = false;
        $.each(metrics, function (label, metric_values) {
            $.each(metric_values, function (index, metric_value) {
                if (metric_value['is_published'] === true && is_valid === false) {
                    is_valid = true;
                }
            })
        });
        return is_valid;
    }

    function is_valid_feature(data) {
        is_valid = false;
        $.each(data, function (key, label_metric) {
            $.each(label_metric, function (label, metrics) {
                $.each(metrics, function (index, metric) {
                    if (metric['is_published'] === true) {
                        is_valid = true;
                    }
                })
            })
        });
        return is_valid;
    }

    function load_feature(data, edit_mode) {
        feature = feature.replaceAll('.', '_');
        let labels = data['labels'];
        let units = data['units'];

        $.each(units, function (index, unit) {
            if (unit != null) {
                units[index] = unit.split('.')[1]
            }
        });

        // Construct base table and header
        $('#white-paper').append('<div class="table-responsive"><table id="' + feature + '" class="table table-sm table-bordered"><thead></thead><tbody></tbody></table></div>');
        $('#' + feature + ' thead').append('<tr><th scope="col" colspan="100%">' + feature + '</th></tr>');

        // Construct table body containing metric label
        let body_id = '#' + feature + ' tbody';
        $(body_id).append('<tr><th scope="row">Dataset</th></tr>');
        $.each(labels, function (label_index, label) {
            $('#' + feature + ' tbody tr').append('<td>' + label + '</td>');
        });

        // Construct table body containing metric data
        $.each(data['data'], function (dataset, metrics) {
            if (edit_mode === false && is_valid_config(metrics)) {
                construct_data_cell(dataset, metrics, edit_mode, body_id, labels)
            } else if (edit_mode) {
                construct_data_cell(dataset, metrics, edit_mode, body_id, labels)
            } else {
                console.log('Invalid dataset ' + dataset);
            }
        });
    }

    function construct_tables(metric_tables, edit_mode) {
        console.log('----- Constructing ALL tables -----');
        console.log(metric_tables);
        $.each(metric_tables, function (feature, data) {
            if (edit_mode === false && is_valid_feature(data['data']) === false) {
                console.log('Not loading in valid feature: ' + feature);
            } else {
                load_feature(data, edit_mode);
            }
        });
    }

    function construct_data_cell(dataset, metrics, edit_mode, body_id, labels) {
        $(body_id).append('<tr></tr>');

        // Construct dataset cell
        $(body_id + ' tr:last').append('<th><ul></ul></th>');
        var config = JSON.parse(dataset);
        $.each(config, function (key, value) {
            $(body_id + ' tr:last th ul').append('<li>' + key + ': ' + value + '</li>')
        });

        // Construct metric data
        $.each(labels, function (index, label) {
            metric_selector_id = (dataset + label).hashCode();
            // $(body_id + ' tr:last').append('<td><select id="' + metric_selector_id + '" class="custom-select" disabled></select></td>');
            $(body_id + ' tr:last').append('<td id="' + metric_selector_id + '"></td>');

            $.each(metrics[label], function (metric_index, metric) {
                var option_val = metric['val'] + ' ' + metric['unit'] + ((edit_mode) ? ' - ' + metric['version'] : '');
                option_val = option_val.substring(0, 30);
                if (edit_mode) {
                    $('#' + metric_selector_id).append('<label class="container">' + option_val +
                        '<input id="' + metric['id'] + '" type="checkbox">' +
                        '<i class="text-primary" style="position: absolute; margin-left: 8px; display: none;">Saved!</i>' +
                        '<span class="checkmark"></span></label>');
                    if (metric['is_published'] === true) {
                        $('#' + metric['id']).prop('checked', true);
                    }
                    add_metric_listener(metric['id']);
                } else if (metric['is_published'] === true) {
                    $('#' + metric_selector_id).append('<label id="' + metric['id'] + '" class="container">' + option_val + '</label>');
                    return false;
                }
            });


        });
    }

    let Page = {
        EXTERNAL_WHITE_PAPER: 1,
        INTERNAL_WHITE_PAPER: 2
    };

    var current_page_view = Page.EXTERNAL_WHITE_PAPER;
    load_white_paper(false);

    function is_allowed_to_edit() {
        let username = $.ajax({
            url: performance_api,
            type: 'GET',
            async: false,
            dataType: "json",
            timeout: 1000,
            retries: 3,
            retryInterval: 1000,
            data: {
                'feature': 'vmware',
                'branch': '5.0'
            }
        }).responseJSON['vmware']['username'];
        return username != null && username === 'dev-admin';
    }

    $('#branch_selector').change(function () {
        load_white_paper(current_page_view === Page.INTERNAL_WHITE_PAPER);
    });

    function load_white_paper(edit_mode) {
        console.log('Loading edit mode: ' + edit_mode);
        $('#white-paper').empty();

        $.getJSON("get_feature_list", function (feature_list) {
            load_metric_by_feature($('#branch_selector').val(),
                feature_list, edit_mode);
        });
    }

    $('#external-white-paper-nav').click(function () {
        deactivate_nav();
        current_page_view = Page.EXTERNAL_WHITE_PAPER;
        load_white_paper(false);

        $(this).addClass('active')
    });

    $('#internal-white-paper-nav').click(function () {
        // if (is_allowed_to_edit()) {
        deactivate_nav();
        current_page_view = Page.INTERNAL_WHITE_PAPER;
        load_white_paper(true);
        $(this).addClass('active')
        // } else {
        //     alert('Need admin privilege to view this tab');
        // }
    });

    function deactivate_nav() {
        $('nav li').each(function (index, value) {
            value.classList.remove('active');
        })
    }
});
