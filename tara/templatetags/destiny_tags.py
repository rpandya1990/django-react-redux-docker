import json

from django import template
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from atlantis_lib.enums import TestStatus
from destiny.models import TestJobServer, TestCase
from yoda.lib.pyext.collections_utils import CollectionUtils

register = template.Library()
cl = CollectionUtils()


def get_compressed(main_label):
    if main_label and len(main_label) > 100:
        return main_label[:100] + "<span style='font-weight: 700'> . . . < T R U N C A T E D > . . . </span>"
    return main_label


@register.simple_tag
def lookup(data, key, default=''):
    return data[key] if key in data else default


@register.simple_tag
def get_status_icon(status):
    icon_map = dict(
        success='beenhere',
        skip='low_priority',
        notrun='panorama_fish_eye',
        xfail='healing',
        uxpass='add_alert',
        error='remove_circle_outline',
        fail='adb',

    )
    return icon_map[status]


@register.simple_tag()
def render_test_status_row(table_data, version, testcase, color_map, branch):
    html_body_template = """{status}"""
    html_cell_template = """        
    <a class="btn-floating waves-effect waves-light tooltipped {status_color}"
     data-position="bottom" 
     data-delay="50"
     data-tooltip="{tooltip}"     
     href="{job_url}"
      target="_blank" 
      style="color:rgba(0, 0, 0, 0.87)">
        <i class="material-icons">{status_icon}</i>
      </a>    
    """
    server_url = TestJobServer.objects.get(
        data__branch=branch).server_url
    status = cl.find_one(
        [version, testcase, 'status'],
        table_data,
        error_on_multiple=False
    )
    if not status:
        status = 'notrun'

    status_message = cl.find_one(
        [version, testcase, 'status_message'],
        table_data,
        error_on_multiple=False
    )
    if status_message is None:
        status_message = ''

    testresult_id = cl.find_one(
        [version, testcase, 'testresult_id'],
        table_data,
        error_on_multiple=False
    )

    job_url = cl.find_one(
        [version, testcase, 'job_url'],
        table_data,
        error_on_multiple=False
    )
    if not job_url:
        test_job = TestCase.objects.get(
            name=testcase, version__branch__name=branch
        ).testsuite_set.first()
        job_url = "{}/job/{}".format(server_url,
                                     test_job.name) if test_job else server_url

    url = "/destiny/testresult/{}/change/".format(testresult_id) if status != "notrun" else job_url

    status_color = color_map.get(status)
    status_icon = get_status_icon(status)

    try:
        if status_message:
            tooltip = status + ":" + status_message
        else:
            tooltip = status
        _status = html_cell_template.format(status_color=status_color,
                                            status_icon=status_icon,
                                            tooltip=tooltip,
                                            job_url=url,
                                            status_message=status_message if status_message else '')
        html = format_html(
            html_body_template.format(
                status_color=status_color,
                status=_status)
        )
    except Exception:
        if status_message:
            tooltip = status + ":" + ''
        else:
            tooltip = status
        _status = html_cell_template.format(status_color=status_color,
                                            status_icon=status_icon,
                                            tooltip=tooltip,
                                            job_url=url,
                                            status_message="")
        html = format_html(
            html_body_template.format(
                status=_status
            )
        )
    return html

@register.simple_tag()
def render_state_breakdown_detail(state, detail):
    html = """
    <td class="state">{state}</td>
    <td>{jira}</td>
    <td>{reasons}</td>
    <td>{triage_resolution}</td>
    <td>{triaged_pending}</td>
    """

    jira = ""
    if detail['jira']:
        jira = """<a href="{jira_url}" target="_blank" >{jira_count}</a>""".format(
            jira_count=detail['jira'][0],
            jira_url=detail['jira'][1],
        )
    else:
        detail['jira'] = ""

    if detail['reasons']:
        _resons_html = """
          <div class="collection">
            {list_data}
          </div>
        """
        list_data = []
        for k in detail['reasons']:
            total_count = detail['reasons'][k]["total_res_count"]
            big_html_id = detail['reasons'][k]["id"]

            dupe_list = []
            for dupe, dupe_details in detail['reasons'][k]["dupe_counter"].items():
                dupe_count = len(dupe_details)

                html_dupe_details = []
                little_html_id = "test-list"
                for test_id, test_case in dupe_details:
                    short_name = short_name_test_name_naked(test_case)
                    little_html_id += str(test_id)
                    html_dupe_details.append("""
                    <a class="test-case {primary_dupe}" href="/destiny/testresult/{test_id}/change/">{short_name}</a>
                    """.format(test_id=test_id, short_name=short_name, primary_dupe="primary-dupe-small" if big_html_id == test_id else "",))

                dupe_list.append("""
                <div class="dupe {big_id} {primary_dupe}" data-id={id}>
                    <div id="{id}" class="test-cases" style="display: none">
                        <div style="font-size: 25px; margin-bottom: 5px;">Test Cases</div>
                        {dupe_details}
                    </div>
                    <div style="margin-top: 5px; min-height: 25px;">
                        <span class="badge" style="color: white;">{dupe_count}</span>
                        <span id="{id}dupesmall" style="display:block">{smalldupe}</span>
                        <span id="{id}dupebig" style="display:none">{bigdupe}</span>
                    </div>
                </div>""".format(smalldupe=get_compressed(dupe), bigdupe=dupe, dupe_count=dupe_count,
                                 primary_dupe="primary-dupe" if dupe == k else "", dupe_details="".join(html_dupe_details), id=little_html_id,
                                 big_id=big_html_id))

            list_data.append(
                """<div class="collection-item" data-id={id}>
                        <i class="material-icons" id="{id}arrow" style="font-size: 30px">arrow_right</i>
                        <span id="{id}mainsmall" style="margin-right:auto;display:block">{smallk}</span>
                        <span id="{id}mainbig" style="margin-right:auto;display:none">{bigk}</span>
                        <span class="badge" style="color: white;float: none;">{total_count}</span>
                    </div><div class="collection-item" style="display:none" id={id}>{dupe_list}</div>
                    """.format(smallk=get_compressed(k), bigk=k, total_count=total_count, dupe_list="<br/>".join(dupe_list), id=big_html_id))
        _resons_html = _resons_html.format(list_data="".join(list_data))
        detail['reasons'] = _resons_html
    else:
        detail['reasons'] = ""

    if detail['triage_resolution']:
        _resons_html = """
          <div class="collection">
            {list_data}
          </div>
        """
        list_data = []
        for k, v in detail['triage_resolution'].most_common():
            list_data.append("""<div class="collection-item"><span class="badge" style="color: white;">{v}</span><span>{k}</span></div>""".format(k=k, v=v))
        _resons_html = _resons_html.format(list_data="".join(list_data))
        detail['triage_resolution'] = _resons_html
    else:
        detail['triage_resolution'] = ""

    html = html.format(**dict(
        state=capitalize(state),
        jira=jira,
        reasons=detail['reasons'],
        triage_resolution=detail['triage_resolution'],
        triaged_pending=detail['triage_pending']
    ))
    return mark_safe(html)


def short_name_test_name_naked(text, parts=2):
    sections = text.split('.')
    return "{}".format('.'.join(sections[-parts:]))


@register.simple_tag
def short_name_test_name(text):
    sections = text.split('.')
    return format_html("{}".format('<br>&nbsp;&nbsp;'.join(sections[-2:])))


@register.simple_tag
def capitalize(data):
    return data.capitalize()


@register.simple_tag
def status_badges(status_name):
    """
    success = 'Success'
    skip = 'Skip'
    notrun = 'NotRun'
    xfail = 'XFail'
    uxpass = 'UxPass'
    error = 'Error'
    fail = 'Fail'
    :param statuses:
    :return:
    """
    badge_map = {
        TestStatus.success.name: "badge-success",
        TestStatus.fail.name: "badge-danger",
        TestStatus.error.name: "badge-primary",
        TestStatus.skip.name: "badge-secondary",
        TestStatus.notrun.name: "badge-light",
        TestStatus.xfail.name: "badge-warning",
        TestStatus.uxpass.name: "badge-info"

    }

    return badge_map.get(status_name, "badge-dark")


@register.filter
def is_dict(data):
    return isinstance(data, dict)


@register.filter
def check(key):
    return key[0].isdigit()


@register.filter
def jsonify(obj):
    from dotmap import DotMap
    if isinstance(obj, list):
        obj = [item.toDict() if isinstance(item, DotMap) else item
               for item in obj]
    if isinstance(obj, DotMap):
        obj = obj.toDict()
    return json.dumps(obj)


@register.filter
def capitalize_first(string):
    return string[0].upper() + string[1:]
