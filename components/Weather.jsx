import react from "react"
import { Image, Text, View } from "react-native"

export default function Weather(){
    return(
        <View>
        <Image source={require('../assets/cloud-with-sun-3d-weather-png.webp')} style={{width:100, height:100}}/>
        <Text>28°</Text>
        <Text>Precipitações</Text>
        <View style={{flexDirection:'row', gap: 5}}>
            <View style={{flexDirection:'row', gap: 5}}>
                <Text>Max:</Text>
                <Text>31°</Text>
            </View>
            <View style={{flexDirection:'row', gap: 5}}>
                <Text>Min:</Text>
                <Text>25°</Text>
            </View>
        </View>
        </View>
    )
}