import React,{useState} from "react";
import {SafeAreaView,StatusBar,StyleSheet,Text,View,TouchableOpacity,TextInput} from "react-native";
export default function App() {
const [status,setStatus]=useState("Online");
return (
<SafeAreaView style={{flex:1,backgroundColor:"#f9fafb"}}>
<View style={{flex:1,padding:24,justifyContent:"center",alignItems:"center"}}>
<Text style={{fontSize:26,fontWeight:"900",color:"#111827"}}>SkillBridge Rider Node</Text>
<Text style={{fontSize:13,color:"#4b5563",marginBottom:24}}>Hyperlocal Independent Delivery Log Ledger</Text>
<View style={{width:"100%",maxWidth:440,backgroundColor:"#eff6ff",borderRadius:16,padding:20,alignItems:"center",borderWidth:1,borderColor:"#bfdbfe"}}>
<Text style={{fontSize:11,fontWeight:"800",color:#2563eb}}>AVAILABLE BALANCE (GHS)</Text>
<Text style={{fontSize:32,fontWeight:"900",color:"#1e3a8a",marginTop:6}}>₵ 400.00</Text>
</View>
<View style={{width:"100%",maxWidth:440,marginTop:24}}>
<Text style={{fontSize:11,fontWeight:"700",color:"#374151",marginBottom:8}}>RIDER OPERATIONAL STATUS</Text>
<View style={{flexDirection:"row",gap:8}}>
{["Online","Offline","In-Routine"].map(m=>(
<TouchableOpacity key={m} onPress={()=>setStatus(m)} style={[{flex:1,paddingVertical:10,backgroundColor:"#fff",borderRadius:10,alignItems:"center",borderWidth:1,borderColor:"#d1d5db"},status===m&&(m==="Online"?{backgroundColor:"#16a34a",borderColor:"#16a34a"}:m==="Offline"?{backgroundColor:"#dc2626",borderColor:"#dc2626"}:{backgroundColor:"#d97706",borderColor:"#d97706"})]}>
<Text style={[{fontSize:13,fontWeight:"600",color:"#4b5563"},status===m&&{color:"#fff",fontWeight:"700"}]}>{m}</Text>
</TouchableOpacity>
))}
</View>
</View>
<View style={{width:"100%",maxWidth:440,marginTop:24}}>
<Text style={{fontSize:11,fontWeight:"700",color:"#374151",marginBottom:8}}>Withdrawal Value (₵)</Text>
<TextInput placeholder="e.g. 50.00" keyboardType="numeric" placeholderTextColor="#9ca3af" style={{width:"100%",backgroundColor:"#fff",padding:12,borderWidth:1,borderColor:"#d1d5db",borderRadius:10,fontSize:14,marginBottom:14}} />
<TouchableOpacity style={{width:"100%",backgroundColor:"#2563eb",padding:14,borderRadius:10,alignItems:"center"}}>
<Text style={{color:"#fff",fontSize:14,fontWeight:"700"}}>Authorize Instant Cashout</Text>
</TouchableOpacity>
</View>
</View>
</SafeAreaView>
);
}
