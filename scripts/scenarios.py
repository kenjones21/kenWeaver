#!/usr/bin/python3

import csv
import matplotlib.pyplot as plt
import numpy as np
import statsmodels.api as sm
import scipy.optimize as opt
import math

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

def medianTemps():
    medianDict = {}
    string = "Temperature|Global Mean|MAGICC6|MED"
    for datum in data:
        model, scenario = datum["MODEL"], datum["SCENARIO"]
        pair = (model, scenario)
        variable = datum["VARIABLE"]
        if variable == string:
            if pair not in medianDict:
                medianDict[pair] = {}
            medianDict[pair] = datum
            print(datum)
    return medianDict

def median2100():
    medianDict = {}
    string = "Temperature|Global Mean|MAGICC6|MED"
    for datum in data:
        model, scenario = datum["MODEL"], datum["SCENARIO"]
        pair = (model, scenario)
        variable = datum["VARIABLE"]
        if variable == string:
            if pair not in medianDict:
                medianDict[pair] = {}
            medianDict[pair] = float(datum['2100'])
            print(datum)
    return medianDict

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
            print(len(y), len(x))
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
            f.write(str(y[i]))
        f.write("\n")
    f.close()
    return

def exportProb(filename, x, yarr, columns):
    for y in yarr:
        if len(y) != len(x):
            print(len(y), len(x))
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
    return

def integrate(function, begin, end, step, params):
    x = begin
    integral = 0
    while (x < end):
        val = function(x, params)
        integral += val * step
        x += step
    return integral

def gaussian(x, params):
    b = params["b"]
    c = params["c"]
    a = 1 / math.sqrt(2 * math.pi * c ** 2)
    return a * math.exp(- ((x - b) ** 2) / (2 * c ** 2))

def interpolateFun(xi, xFun, yFun):
    index = 0
    while xFun[index] < xi:
        index += 1
    x1 = xFun[index-1]
    x2 = xFun[index]
    y1 = yFun[index-1]
    y2 = yFun[index]
    m = (y2 - y1)/(x2 - x1)
    return y1 + m * (xi - x1)

def gaussInt(params, minimum, maximum):
    x = np.linspace(minimum, maximum, 1000)
    y = []
    prevX = x[0]
    theSum = integrate(gaussian, params["b"] - 5 * params["c"], prevX, 0.1, params)
    for xi in x:
        theSum += integrate(gaussian, prevX, xi, 0.1, params)
        prevX = xi
        y.append(theSum)
    return x, y

def squares1(xFun, yFun, xarr, yarr):
    sumsq = 0
    for i in range(0, len(xarr)):
        x, y = xarr[i], yarr[i]
        interpolation = interpolateFun(x, xFun, yFun)
        sumsq += (y - interpolation) ** 2
    return sumsq

def squares(params):
    # Assume sums, probs are already defined
    pad = 100
    paramDict = {"b": params[0], "c": params[1]}
    gaussX, gaussY = gaussInt(paramDict, min(sums) - pad, max(sums) + pad)
    return squares1(gaussX, gaussY, sums, probs)
        
readFile("../res/ar5_scenarios.csv")
# med2100 = median2100()
# temps = ["1.5", "2.0", "3.0", "4.0"]
# columnNames = ["one_five", "two", "three", "four"]
# smoothedExcProbs = []
# for i in range(0, 4):
#     temp = temps[i]
#     excProb = exceedanceProbabilities()
#     a = maxExceedanceProbabilities(excProb, temp)
#     b = emissionsSums(2017)
#     c = exceedance2100(excProb, temp)
#     print(c)
#     merged = mergeExcSums(c, b)
#     sums, probs = getXY(merged)
#     sums, probs = sortXY(sums, probs)
#     lowess = sm.nonparametric.lowess(probs, sums, frac=0.30)
#     smoothedExcProbs.append(lowess)
# export("../res/budget.csv", sums, smoothedExcProbs
"""
# Params:
param1_5 = {"b": 97, "c": 890}
# 1.5: 97, 890
param2 = {"b": 1163, "c": 983}
# 2.0: 1163, 983
param3 = {"b": 3035, "c": 1355}
# 3.0: 3035, 1355
param4 = {"b": 5114, "c": 2027}
# 4.0: 5114, 2027
temps = ["","one_five", "two", "three", "four"]
allparams = [param1_5, param2, param3, param4]
"""
temp = "2.0"
excProb = exceedanceProbabilities()
d = maxExceedanceProbabilities(excProb, temp)
e = emissionsSums(2017)
f = exceedance2100(excProb, temp)
merged = mergeExcSums(f, e)
#mergedMedian = mergeExcSums(med2100, e)
#sums, med = getXY(mergedMedian)
#sums, med = sortXY(sums, med)

# export("../res/median.csv", sums, [med], ["em", "medianTemp"])
sums, probs = getXY(merged)
sums, probs = sortXY(sums, probs)
"""
yFuns = []
for i in range(0, 4):
    temp = temps[i]
    param = allparams[i]
    pad = 100
    gaussX, gaussY = gaussInt(param, min(sums) - pad, max(sums) + pad)
    print(len(gaussX), len(gaussY))
    yFuns.append(gaussY)
export("../res/smoothed.csv", gaussX, yFuns, temps)
"""
barr = np.linspace(800, 1600, 40)
carr = np.linspace(900, 1100, 40)
#paramStart = [4000, 1200]
fits = []
#optObj = opt.minimize(squares,paramStart)
#optX = optObj.x
#optX = [3000, 1200]
#print("b, c is ", optX)

params = {}
minsum = 99999999999
for b in barr:
    params["b"] = b
    for c in carr:
        params["c"] = c
        x, y = gaussInt(params, min(sums) - 100, max(sums) + 100)
        sq1 = squares1(x, y, sums, probs)
        fits.append(sq1)
        if sq1 < minsum:
            print("sumsq for b, c ", b, c, " is ", sq1)
            minb, minc = b, c
            minsum = sq1
# Fit says 1163 983 minimum for 2C
fits = np.reshape(fits, [len(barr), len(carr)])
print(fits)
fig, ax = plt.subplots()
im = ax.imshow(fits, extent=[min(carr),max(carr), max(barr), min(barr)])
fig.colorbar(im)

ax.axis('tight')
plt.show()
print("Min b, c", b, c)
"""
params = {"b": optX[0], "c": optX[1]}
m = np.linspace(min(sums) - 100, max(sums) + 100, 100)
y = []
minm = min(m)
prevN = m[0]
theSum = integrate(gaussian, params["b"] - 5 * params["c"], prevN, 0.1, params)
for n in m:
    theSum += integrate(gaussian, prevN, n, 0.1, params)
    prevN = n
    y.append(theSum)

plt.scatter(sums, probs, s=10)
plt.plot(m, y, color="red")
plt.title("Probability of Exceedance, " + temp + " degrees C")
plt.show()
"""
# TESTS
# testYear = data[76]
# print(emissionsSum(testYear, 2009) - emissionsSum(testYear, 2010))
# params = {"b": 0, "c": 3}
# m = np.linspace(-5, 5, 500)
# y = []
# print(m)
# for n in m:
#     y.append(integrate(gaussian, -6, n, 0.1, params))
# plt.scatter(m, y)
# plt.show()
#val = integrate(gaussian, -100, 100, 0.01, params)
#print("Expected 1, val is " + str(val))
