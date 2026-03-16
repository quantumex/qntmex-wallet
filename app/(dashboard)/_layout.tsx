// app/(dashboard)/_layout.tsx
import { View, StyleSheet } from "react-native";
import { Slot, Redirect } from "expo-router";
import { useWalletStore } from "@/walletStore";
import BottomNav from "../../components/BottomNav";
export default function DashboardLayout(){const{wallet}=useWalletStore();if("wallet||!wallet.address)return<Redirect href="/(auth)/onboarding"/>;return(<View style={styles.container}><Slot/><BottomNav/></View>);}const styles=StyleSheet.create({container:{flex:1,backgroundColor:"#070705"}});
