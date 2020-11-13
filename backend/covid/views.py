from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.exceptions import APIException

from covid.models import DailyDatum
from covid.serializers import DataSerializer

class BadParameters(APIException):
    status_code = 400
    default_detail = "Parameters invalid for this endpoint"
    default_code = "bad_request"

@api_view(['GET'])
def get_data(request):
    params = request.query_params
    data = DailyDatum.objects.all()
    if "county" in params:
        data = data.filter(county__name=params['county'])
    if "state" in params:
        data = data.filter(county__state__name=params['state'])
    if "date" in params:
        if "start" in params or "end" in params:
            raise BadParameters("Cannot include start or end with date")
        data = data.filter(date=params["date"])
    if "start" in params:
        data = data.filter(date__gte=params["start"])
    if "end" in params:
        data = data.filter(date__lt=params["end"])

    serializer = DataSerializer(data, many=True)
    return Response(serializer.data)

