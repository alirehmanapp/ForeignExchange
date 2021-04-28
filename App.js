/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    StatusBar,
    FlatList,
    View,
    Text,
    TextInput,
    Pressable,
    LogBox
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

LogBox.ignoreAllLogs(true)

const EXCHANGE_API_KEY = "76d6acb0420f7522a14a1700bb00123b"

const DEFAULT_CURRENCIES = [
    "USD", "IDR", "GBP", "SGD"
]

const App = () => {

    const [allCurrencies, setAllCurrencies] = useState([])
    const [filteredCurrencies, setFilteredCurrencies] = useState([])
    const [currenciesJsonObject, setCurrenciesJsonObject] = useState([])
    const [selectedCurrenciesCodes, setSelectedCurrenciesCodes] = useState(DEFAULT_CURRENCIES)
    const [rates, setRates] = useState([])
    const [amount, setAmount] = useState("1.00")
    const [showAddCurrencyInput, setShowAddCurrencyInput] = useState(false)
    const [newCurrency, setNewCurrency] = useState("")

    const fetchAllSymbols = () => {
        let url = `http://api.exchangeratesapi.io/v1/symbols?access_key=${EXCHANGE_API_KEY}&format=1`
        fetch(url, {
            method: 'GET'
        }).then((response) => {
            return response.json()
        }).then((response) => {
            if (response.success) {
                const symbolsJsonObject = response.symbols
                const symbolsConvertedList = Object.keys(symbolsJsonObject).map((key, index) => {
                    return {
                        currencyCode: key,
                        currencyDescriptoin: `${key} - ${symbolsJsonObject[key]}`,
                    };
                });
                setCurrenciesJsonObject(symbolsJsonObject)
                setAllCurrencies(symbolsConvertedList)
            }
        }).catch((error) => {
            console.log('fetchAllSymbols-error', error)
        })
    }

    const fetchLatest = (symbolsList) => {
        let url = `http://api.exchangeratesapi.io/v1/latest?access_key=${EXCHANGE_API_KEY}&format=1`
        let symbolsString = '&symbols='
        if (symbolsList.length > 0) {
            symbolsList.map((item, index) => {
                symbolsString += index == 0 ? `&symbols=${item}` : `,${item}`
            })
        } else {
            setRates([])
            return
        }
        url += symbolsString
        fetch(url, {
            method: 'GET'
        }).then((response) => {
            return response.json()
        }).then((response) => {
            if (response.success) {
                const ratesJsonObject = response.rates
                const ratesConvertedList = Object.keys(ratesJsonObject).map((key) => {
                    return {
                        currencyCode: key,
                        currencyRate: ratesJsonObject[key]
                    };
                });
                console.log('fetchLatest-response', ratesConvertedList)
                setRates(ratesConvertedList)
            }
        }).catch((error) => {
            console.log('error', error)
        })
    }

    useEffect(() => {
        fetchAllSymbols()
        setInterval(() => {
            fetchLatest(selectedCurrenciesCodes)
        }, 2000);
    }, [])

    const renderItem = ({ item, index }) => {
        let calculatedRate = 1.00
        calculatedRate = (amount ? parseFloat(amount) : 1.00) * item.currencyRate
        return (
            <View style={styles.cardStyle}>
                <View style={{ flex: 1, padding: 10, }}>
                    <View style={styles.rowContainer}>
                        <Text style={styles.calculatedRateTextStyle}>{item.currencyCode}</Text>
                        <Text style={styles.calculatedRateTextStyle}>{calculatedRate.toLocaleString()}</Text>
                    </View>
                    <Text style={styles.detailTextStyle}>{item.currencyCode} - {currenciesJsonObject[item.currencyCode]}</Text>
                    <Text style={styles.rateDetailTextStyle}>{"1"} {item.currencyCode} = {item.currencyCode} {item.currencyRate}</Text>
                </View>
                <Pressable
                    style={styles.removeButtonStyle}
                    onPress={() => {
                        let selectedCurrenciesCodesTemp = [...selectedCurrenciesCodes]
                        selectedCurrenciesCodesTemp = selectedCurrenciesCodesTemp.filter((subItem) => {
                            console.log('test-', item.currencyCode, subItem)
                            return item.currencyCode != subItem
                        })
                        fetchLatest(selectedCurrenciesCodesTemp)
                        setSelectedCurrenciesCodes(selectedCurrenciesCodesTemp)
                    }}>
                    <Text>{"( - )"}</Text>
                </Pressable>
            </View>
        )
    }

    const renderNewCurrencyItem = ({ item, index }) => {
        return (
            <Pressable
                style={{ paddingVertical: 5 }}
                onPress={() => {
                    let selectedCurrenciesCodesTemp = selectedCurrenciesCodes
                    selectedCurrenciesCodesTemp.push(item.currencyCode)
                    fetchLatest(selectedCurrenciesCodesTemp)
                    setSelectedCurrenciesCodes(selectedCurrenciesCodesTemp)
                    setNewCurrency("")
                    setFilteredCurrencies([])
                }}>
                <Text style={styles.detailTextStyle}>{item.currencyCode} - {currenciesJsonObject[item.currencyCode]}</Text>
            </Pressable>
        )
    }

    return (
        <>
            <StatusBar barStyle="dark-content" />
            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ flex: 1, padding: 20 }}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.detailTextStyle}>{"EUR - Euro"}</Text>
                        <View style={styles.rowContainer}>
                            <Text style={styles.headerText}>{"EUR"}</Text>
                            <TextInput
                                style={styles.amountInputStyle}
                                value={amount}
                                placeholder={"1.00"}
                                maxLength={25}
                                autoCapitalize={'none'}
                                keyboardType={'decimal-pad'}
                                onChangeText={(text) => {
                                    setAmount(text)
                                }}
                            />
                        </View>
                    </View>
                    <KeyboardAwareScrollView
                        contentContainerStyle={{ flexGrow: 1 }}
                        style={{ flex: 1 }}
                        extraHeight={300}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled">
                        <View>
                            <FlatList
                                listKey={"rates_list"}
                                data={rates}
                                renderItem={renderItem}
                                keyExtractor={(item, index) => (item.currencyCode + index)}
                                contentContainerStyle={{ width: '100%' }}
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                            />
                        </View>
                        {showAddCurrencyInput ?
                            <View>
                                <TextInput
                                    style={styles.addCurrencyInputStyle}
                                    value={newCurrency}
                                    placeholder={"USD"}
                                    maxLength={25}
                                    autoCapitalize={'none'}
                                    keyboardType={'decimal-pad'}
                                    onChangeText={(text) => {
                                        setNewCurrency(text)
                                        if (text.length == 0) setFilteredCurrencies([])
                                        else {
                                            let allCurrenciesTemp = [...allCurrencies]
                                            allCurrenciesTemp = allCurrenciesTemp.filter((item) => {
                                                return ((item?.currencyCode.toLowerCase().indexOf((text + "").toLowerCase()) >= 0) ||
                                                    (item?.currencyDescriptoin.toLowerCase().indexOf((text + "").toLowerCase()) >= 0) ||
                                                    selectedCurrenciesCodes.includes[item.currencyCode] == false) &&
                                                    item?.currencyCode !== "EUR"
                                            })
                                            setFilteredCurrencies(allCurrenciesTemp)
                                        }
                                    }}
                                />
                                <FlatList
                                    listKey={"currencies_list"}
                                    data={filteredCurrencies}
                                    extraData={filteredCurrencies}
                                    renderItem={renderNewCurrencyItem}
                                    keyExtractor={(item, index) => (item.currencyCode + "currencies_list")}
                                    contentContainerStyle={{ width: '100%' }}
                                    showsVerticalScrollIndicator={false}
                                    keyboardShouldPersistTaps="handled"
                                />
                                <View style={{ height: 150 }} />
                            </View>
                            :
                            <Pressable
                                style={styles.addMoreCurrencyButton}
                                onPress={() => setShowAddCurrencyInput(true)}>
                                <Text style={styles.headerText}>{"( + ) Add More Currencies"}</Text>
                            </Pressable>
                        }
                    </KeyboardAwareScrollView>
                </View>
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    inputContainer: {
        padding: 10,
        borderWidth: 1,
    },
    amountInputStyle: {
        height: 40,
        width: '70%',
        textAlign: 'right',
        paddingHorizontal: 10,
        fontSize: 18,
        fontWeight: '600',
        lineHeight: 22,
        backgroundColor: '#00000010'
    },
    headerText: {
        fontSize: 18,
        fontWeight: '600',
        lineHeight: 22
    },
    cardStyle: {
        width: '100%',
        borderWidth: 1,
        marginTop: 10,
        flexDirection: 'row'
    },
    rowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    calculatedRateTextStyle: {
        fontSize: 18,
        lineHeight: 22
    },
    detailTextStyle: {
        fontStyle: 'italic',
        fontWeight: '600',
        lineHeight: 20
    },
    rateDetailTextStyle: {
        fontStyle: 'italic',
        lineHeight: 20
    },
    removeButtonStyle: {
        borderLeftWidth: 1,
        paddingHorizontal: 10,
        justifyContent: 'center'
    },
    addMoreCurrencyButton: {
        height: 45,
        paddingHorizontal: 10,
        borderWidth: 1,
        marginTop: 10,
        marginBottom: 40,
        alignItems: 'center',
        justifyContent: 'center'
    },
    addCurrencyInputStyle: {
        fontSize: 18,
        lineHeight: 22,
        fontWeight: '600',
        height: 45,
        paddingHorizontal: 10,
        borderWidth: 1,
        marginTop: 10,
        marginBottom: 40
    },
});

export default App;
