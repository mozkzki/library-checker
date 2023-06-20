import json
import os
import sys
from typing import Dict, List

import moz_library
import requests


def handler_check_rental(event: Dict, context):
    _check_envs()
    is_reply = event.get("is_reply", False)
    _check_rental(is_reply)
    return _retern_body()


def handler_check_expire(event: Dict, context):
    _check_envs()
    is_reply = event.get("is_reply", False)
    _check_expire(is_reply)
    return _retern_body()


def handler_check_reserve(event: Dict, context):
    _check_envs()
    is_reply = event.get("is_reply", False)
    _check_reserve(is_reply)
    return _retern_body()


def handler_check_prepare(event: Dict, context):
    _check_envs()
    is_reply = event.get("is_reply", False)
    _check_prepare(is_reply)
    return _retern_body()


def _check_envs():
    task_root = _check_env("LAMBDA_TASK_ROOT", is_check=False)
    home = _check_env("HOME", is_check=False)
    _check_env("CHROME_BINARY_LOCATION")
    _check_env("CHROME_DRIVER_LOCATION")
    _check_env("LINE_POST_URL")

    if False:
        os.system(f"ls -al {task_root}")
        os.system(f"ls -al {home}")


def _check_env(key: str, is_check: bool = True) -> str:
    value = os.environ.get(key, "")
    if is_check:
        if not value:
            print(f"Not found environment variable: ({key} = {value})")
            sys.exit(1)
    print(f"env | {key}: {value}")
    return value


def _check_rental(is_reply: bool = False):
    zero_behavior = "none"
    if is_reply:
        # 2023/06/01のLINE料金改定対応 (送信メッセージ数制限が200になった)
        # _post_to_line("図書館の貸出状況を調べます。")
        zero_behavior = "message"

    # 貸出本のチェック
    messages = moz_library.search_rental(
        {
            "mode": "rental",
            "all_user": True,
            "debug": True,
            "zero": zero_behavior,
            "header": True,
            "separate": True,
        }
    )
    # 通知
    _post_message(messages)


def _check_expire(is_reply: bool = False):
    zero_behavior = "none"
    if is_reply:
        # 2023/06/01のLINE料金改定対応 (送信メッセージ数制限が200になった)
        # _post_to_line("借りた本で延滞しそうな本が無いかチェックします。")
        zero_behavior = "message"

    # 期限切れが近い貸出本のチェック
    messages = moz_library.search_rental(
        {
            "mode": "expire",
            "all_user": True,
            "debug": True,
            "zero": zero_behavior,
            "header": True,
            "separate": True,
        }
    )
    # 通知
    _post_message(messages)


def _check_reserve(is_reply: bool = False):
    zero_behavior = "none"
    if is_reply:
        # 2023/06/01のLINE料金改定対応 (送信メッセージ数制限が200になった)
        # _post_to_line("図書館の予約状況を調べます。")
        zero_behavior = "message"

    # 予約本のチェック
    messages = moz_library.search_reserve(
        {
            "mode": "reserve",
            "all_user": True,
            "debug": True,
            "zero": zero_behavior,
            "header": True,
            "separate": True,
        }
    )
    # 通知
    _post_message(messages)


def _check_prepare(is_reply: bool = False):
    zero_behavior = "none"
    if is_reply:
        # 2023/06/01のLINE料金改定対応 (送信メッセージ数制限が200になった)
        # _post_to_line("予約した本で届いたものが無いかチェックします。")
        zero_behavior = "message"

    # 到着した予約本のチェック
    messages = moz_library.search_reserve(
        {
            "mode": "prepare",
            "all_user": True,
            "debug": True,
            "zero": zero_behavior,
            "header": True,
            "separate": True,
        }
    )
    # 通知
    _post_message(messages)


def _retern_body():
    return {
        "isBase64Encoded": False,
        "statusCode": 200,
        "headers": {},
        "body": "done.",
    }


def _post_message(messages: List[str]) -> None:
    all_message = ""
    for message in messages:
        if len(all_message) > 0:
            all_message += "\n" + message
        else:
            all_message = message

    if len(messages) > 0:
        _post_to_line(all_message)

    if len(messages) > 0:
        message = """確認・変更はこちら。
↓
[図書館のページ]: https://www.lib.nerima.tokyo.jp/opw/OPS/OPSUSER.CSP"""
        # 2023/06/01のLINE料金改定対応 (送信メッセージ数制限が200になった)
        # _post_to_line(message)


def _post_to_line(message: str) -> None:
    line_message = {"line_message": {"type": "text", "text": message}}
    try:
        requests.post(os.environ["LINE_POST_URL"], data=json.dumps(line_message))
        print("line message posted.")
    except requests.exceptions.RequestException as e:
        print("Request failed: {}".format(e))
