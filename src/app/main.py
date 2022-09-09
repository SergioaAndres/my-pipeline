"""
Provides add arithmetic function
"""
import json
import logging
import re


def add(x_value, y_value):
    """
    Add two numbers.
        Parameters:
            x_value : The first number to add.
            y_value : The second number to add.
        Return:
            number product of the addition operation
    """
    logging.info("Executing operation")
    return x_value + y_value


def validate_number(value):
    """
    Validate that if input is a number and returns a boolean
            Parameters:
                a (value): Input number
            Return:
                Boolean product of validation
    """
    regex = re.compile(r"^\d+$")
    return bool(regex.search(str(value)))


def custom_response(message: str, status_code: int) -> dict:
    """
    Create the lambda custom responde.
        Parameters:
            data : String with the message.
            status_code : Status code for the request
        Return:
            Dictionary with lambda expected structure
    """
    response = {
        "statusCode": status_code,
        "body": json.dumps(message),
        "headers": {
            "Access-Control-Allow-Origin": "https://mytest.poc",
            "Access-Control-Allow-Methods": "GET,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
            "X-Content-Type-Options": "nosniff",
        },
    }
    return response


def lambda_handler(event, context):
    """
    ### Add two numbers.
    Parameters:
    ----------
    - a : The first to add.
    - b : The first to add.
    """
    if (
        "queryStringParameters" in event
        and event["queryStringParameters"] is not None
        and "x" in event["queryStringParameters"]
        and "y" in event["queryStringParameters"]
    ):
        x_input = event["queryStringParameters"]["x"]
        y_input = event["queryStringParameters"]["y"]
    else:
        return custom_response("Invalid request parameters", 400)
    logging.info("Checking inputs")
    if validate_number(x_input) and validate_number(y_input):
        x_value = int(x_input)
        y_value = int(y_input)
        result = str(add(x_value, y_value))
    else:
        return custom_response("Invalid request parameters", 400)
    return custom_response(result, 200)
