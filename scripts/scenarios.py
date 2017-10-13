#!/usr/bin/python3

import csv
import matplotlib.pyplot as plt
import numpy as np
import statsmodels.api as sm

data = []

def readFile(filename):
    cats = []
    readCats = False
    for line in csv.reader(open(filename), delimiter=','):
        if not readCats:
            readCats = True
            cats = line
        else:
            datum = {}
            for i in range(0, len(line)):
                datum[cats[i]] = line[i]
            data.append(datum)

def scenarios():
    retarr = set()
    for datum in data:
        model, scenario = datum["MODEL"], datum["SCENARIO"]
        pair = (model, scenario)
        if pair not in retarr:
            retarr.add(pair)
    return retarr

def getSlice(data, param):
    retarr = []
    for datum in data:
        if param in datum.keys():
            retarr.append(datum[param])
    return retarr

def getFiltered(arr, criterion):
    retarr = []
    for el in arr:
        if el == criterion:
            retarr.append(el)
    return retarr

def getFilteredIndeces(arr, criterion):
    indeces = []
    for i in range(0, len(arr)):
        if arr[i] == criterion:
            indeces.append(i)
    return indeces

def selectData(data, indeces):
    retarr = []
    for i in indeces:
        retarr.append(data[i])
    return retarr

def filterFromData(data, field, criterion): # Duplicate data is confusing maybe
    fieldSlice = getSlice(data, field)
    indeces = getFilteredIndeces(fieldSlice, criterion)
    return selectData(data, indeces)

def avgTotalEmissions(year0, year1, em0, em1):
    y0, y1 = float(year0), float(year1)
    e0, e1 = float(em0), float(em1)
    if y0 == y1:
        return 0
    return (y1 - y0) * ((e0 + e1) / 2)

def interpolate(datum, year):
    keys = datum.keys()
    years = []
    for key in keys:
        if key[0] == "2" and datum[key] != "":
            years.append(key)
    years = sorted(years)
    if year in years:
        return datum[year]
    prevYear = years[0]
    for y in years:
        if year > float(prevYear) and year < float(y):
            dif = float(year) - float(prevYear)
            span = float(y) - float(prevYear)
            em = float(datum[y])
            emPrev = float(datum[prevYear])
            return dif/span*(em - emPrev) + emPrev
        prevYear = y

def subtractTo(theSum, datum, year):
    keys = datum.keys()
    years = []
    for key in keys:
        if key[0] == "2" and datum[key] != "":
            years.append(key)
    years = sorted(years)
    yearPrev = years[0]
    emPrev = datum[yearPrev]

def emissionsSum(datum, startYear):
    keys = datum.keys()
    years = []
    for key in keys:
        if key[0] == "2" and datum[key] != "":
            years.append(key)
    years = sorted(years)
    totalEm = 0
    yearPrev = years[0]
    emPrev = datum[yearPrev]
    for year in years:
        if float(year) <= startYear:
            yearPrev, emPrev = year, datum[year]
        else:
            em = datum[year]
            if startYear > float(yearPrev):
                yearPrev = startYear
                emPrev = interpolate(datum, startYear)
                # Ignore years up to startYear
            totalEm += avgTotalEmissions(yearPrev, year, emPrev, em)
            yearPrev, emPrev = year, datum[year]
    return totalEm / 1000 # Convert to gigatons

def emissionsSums(startYear):
    modelScenarioPairs = []
    sums = {}
    for datum in data:
        model, scenario = datum["MODEL"], datum["SCENARIO"]
        pair = (model, scenario)
        if datum["VARIABLE"] == "Emissions|CO2":
            try:
                theSum = emissionsSum(datum, startYear)
            except ValueError:
                print("womp")
                continue
            sums[pair] = theSum
    return sums

def exceedanceProbabilities():
    exceedanceDict = {}
    beginsWithString = "Temperature|Exceedance Probability|"
    bwslen = len(beginsWithString)
    for datum in data:
        model, scenario = datum["MODEL"], datum["SCENARIO"]
        pair = (model, scenario)
        variable = datum["VARIABLE"]
        if variable[0:bwslen] == beginsWithString:
            if pair not in exceedanceDict:
                exceedanceDict[pair] = {}
            temp = variable[bwslen:bwslen+3]
            exceedanceDict[pair][temp] = datum
    return exceedanceDict

def maxExceedanceProbabilities(exceedanceProbabilities, temp):
    retdict = {}
    for pair in exceedanceProbabilities:
        tempRecord = exceedanceProbabilities[pair][temp]
        maxProb = 0
        for col in tempRecord:
            if col[0] == "2" and tempRecord[col] != "":
                prob = float(tempRecord[col])
                if prob > maxProb:
                    maxProb = prob
        retdict[pair] = maxProb
    return retdict

def exceedance2100(exceedanceProbabilities, temp):
    retdict = {}
    for pair in exceedanceProbabilities:
        tempRecord = exceedanceProbabilities[pair][temp]
        prob = float(tempRecord['2100'])
        retdict[pair] = prob
    return retdict

def mergeExcSums(exc, sums):
    merged = {}
    for pair in sums:
        if pair in exc:
            theSum = sums[pair]
            prob = exc[pair]
            mergeObj = {"excProb": prob, "sum": theSum}
            merged[pair] = mergeObj
    return merged

def getXY(merged):
    sums, probs = [], []
    for pair in merged:
        sums.append(merged[pair]["sum"])
        probs.append(merged[pair]["excProb"])
    return sums, probs

def sortXY(x, y):
    zipped = zip(x, y)
    sortedzip = sorted(zipped)
    xy = list(zip(*sortedzip))
    return xy[0], xy[1]

def export(filename, x, yarr, columns):
    for y in yarr:
        if len(y) != len(x):
            print(len(yarr), len(x))
            raise ValueError("Arrays are different lengths")
    f = open(filename, 'w')
    for column in columns:
        f.write(column)
        f.write(",")
    f.write("\n")
    for i in range(0, len(x)):
        f.write(str(x[i]))
        for y in yarr:
            f.write(",")
            if y[i] < 0:
                f.write("0.0")
            elif y[i] > 1:
                f.write("1.0")
            else:
                f.write(str(y[i]))
        f.write("\n")
    f.close()

def smoothGaussianIntegral(x, y):
    

readFile("../res/ar5_scenarios.csv")
temps = ["1.5", "2.0", "3.0", "4.0"]
columnNames = ["one_five", "two", "three", "four"]
smoothedExcProbs = []
for i in range(0, 4):
    temp = temps[i]
    excProb = exceedanceProbabilities()
    a = maxExceedanceProbabilities(excProb, temp)
    b = emissionsSums(2017)
    c = exceedance2100(excProb, temp)
    print(c)
    merged = mergeExcSums(c, b)
    sums, probs = getXY(merged)
    sums, probs = sortXY(sums, probs)
    lowess = sm.nonparametric.lowess(probs, sums, frac=0.30)
    smoothedExcProbs.append(lowess)
export("../res/budget.csv", sums, smoothedExcProbs)

# plt.scatter(sums, probs, s=10)
# plt.plot(lowess[:, 0], lowess[:, 1], color="red")
# plt.title("Probability of Exceedance, " + temp + " degrees C")
# plt.show()

# TESTS
# testYear = data[76]
# print(emissionsSum(testYear, 2009) - emissionsSum(testYear, 2010))
