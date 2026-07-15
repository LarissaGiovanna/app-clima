import React from "react";
import {StyleSheet, View, Text} from 'react-native'
import MapPin from "lucide-react-native/icons/map-pin";
import { ChevronDown } from "lucide-react-native";

export default function Local(){
    return(
        <View style={styles.container}>
            <MapPin/>
            <Text>Recife</Text>
            <ChevronDown/>
        </View>
    )
}

const styles = StyleSheet.create({
    container:{
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
    }
})