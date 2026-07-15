import react from "react";
import Local from "./Local";
import Notification from "./Notification";
import { View } from "react-native";

export default function Header({navigation}){
    return(
        <View>
            <Local/>
            <Notification/>
        </View>
)
}