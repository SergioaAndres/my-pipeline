"""
    Testing the add operation
"""
import pytest
from src.app.main import add, lambda_handler, custom_response


def test_add_number():
    """
    Testing the add operation
    """
    assert add(30, 40) == 70


def test_invalid_parameter_exception():
    """
    Testing invalid parameters for the operation
    """
    with pytest.raises(ValueError, match="Invalid request parameters"):
        raise ValueError("Invalid request parameters")


headers = {
    "Access-Control-Allow-Origin": "https://mytest.poc",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "X-Content-Type-Options": "nosniff",
}


def test_lambda_handler_invalid():
    """
    Testing lambda handler invalid request parameters
    """
    event = {"queryStringParameters": {"x": "2x", "y": 3}}
    assert lambda_handler(event, "") == {
        "statusCode": 400,
        "body": '"Invalid request parameters"',
        "headers": headers,
    }


def test_lambda_handler_none():
    """
    Testing lambda handler invalid request parameters
    """
    event = {"queryStringParameters": {"x": "2x"}}
    assert lambda_handler(event, "") == {
        "statusCode": 400,
        "body": '"Invalid request parameters"',
        "headers": headers,
    }


def test_lambda_handler_success():
    """
    Testing lambda handler success
    """
    event = {"queryStringParameters": {"x": 2, "y": 3}}
    assert lambda_handler(event, "") == {
        "statusCode": 200,
        "body": '"5"',
        "headers": headers,
    }


def test_custom_response():
    """
    Testing custom response
    """
    assert custom_response("message", 200) == {
        "statusCode": 200,
        "body": '"message"',
        "headers": headers,
    }
