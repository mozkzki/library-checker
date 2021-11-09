from library_checker.index import (
    handler_check_rental,
    handler_check_expire,
    handler_check_reserve,
    handler_check_prepare,
)


class TestIndex:
    def test_handler_check_rental(self) -> None:
        result = handler_check_rental({}, None)
        print(result)

    def test_handler_check_expire(self) -> None:
        result = handler_check_expire({}, None)
        print(result)

    def test_handler_check_reserve(self) -> None:
        result = handler_check_reserve({}, None)
        print(result)

    def test_handler_check_prepare(self) -> None:
        result = handler_check_prepare({}, None)
        print(result)
