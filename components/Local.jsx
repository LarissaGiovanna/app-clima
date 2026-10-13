import React from "react";
import {StyleSheet, View, Text, ActivityIndicator} from 'react-native'
import MapPin from "lucide-react-native/icons/map-pin";
import { ChevronDown } from "lucide-react-native";
import { useFonts, Roboto_400Regular } from '@expo-google-fonts/roboto';

export default function Local(){
    const [fontsLoaded] = useFonts({
        Roboto_400Regular
      })
      if (!fontsLoaded) {
        return <ActivityIndicator size="large" />;
      }
      
    return(
        <View style={styles.container}>
            <MapPin style={{color:'#fff'}}/>
            <Text style={{color:'#fff', fontFamily:'Roboto_400Regular', fontSize: 15}}>Recife</Text>
            <ChevronDown style={{color:'#fff'}}/>
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