import React from 'react';
import {FlatList, ToastAndroid,} from 'react-native';
import {useTranslation} from 'react-i18next';
import SafeScreen from '@/theme/SafeScreen';
import type {RootScreenProps} from "@/screens/navigation";
import Title from "@/components/common/Title";
import {Colors, ListItem, Text} from "react-native-ui-lib";
import {useSelector} from "react-redux";
import {selectDeviceState} from "@/redux/stateStore";
import Clipboard from "@react-native-clipboard/clipboard";

export type EuiccInfoDataType = {
	key: string;
	raw?: any;
	rendered: any;
}

function EuiccInfo({ route,  navigation }: RootScreenProps<'EuiccInfo'>) {
	const { deviceId } = route.params;
	const DeviceState = useSelector(selectDeviceState(deviceId!));

	const { t } = useTranslation(['euiccinfo']);


	const { eid, euiccAddress, euiccInfo2 } = DeviceState;


	const renderRow = (row: EuiccInfoDataType, id: number, t: any) => {
		return (
			<ListItem
				paddingV-0
				paddingH-20
				activeBackgroundColor={Colors.$backgroundNeutralMedium}
				activeOpacity={0.3}
				onPress={() => {
					ToastAndroid.show('Value Copied', ToastAndroid.SHORT);
					Clipboard.setString(row.raw ?? row.rendered)
				}}
				style={{ borderBottomWidth: 0.25, borderBottomColor: Colors.$outlineNeutral }}
			>
				<ListItem.Part middle column>
					<ListItem.Part>
						<Text $textDefault text70BL flex-1 numberOfLines={1}>
							{t('euiccinfo:' + row.key)}
						</Text>
					</ListItem.Part>
						<ListItem.Part>
							<Text $textNeutral text80L style={{ flex: 1, textAlign: 'right'}}>
								{row.rendered ?? "[empty]"}
							</Text>
					</ListItem.Part>
				</ListItem.Part>
			</ListItem>
		);
	}
	return (
		<SafeScreen>
			<Title>{t('euiccinfo:euiccinfo')}</Title>
			<FlatList
				data={[
					{key: "eid", rendered: `${eid}` },
					{key: "sasAcreditationNumber", rendered: euiccInfo2?.sasAcreditationNumber },
					{key: "svn", rendered: euiccInfo2?.svn },
					{key: "freeNonVolatileMemory", rendered: `${euiccInfo2?.extCardResource.freeNonVolatileMemory} B` },
					{key: "freeVolatileMemory", rendered: `${euiccInfo2?.extCardResource.freeVolatileMemory} B` },
					{key: "defaultDpAddress", rendered: euiccAddress?.defaultDpAddress },
					{key: "rootDsAddress", rendered: euiccAddress?.rootDsAddress },
					{key: "euiccCiPKIdListForSigning", rendered: euiccInfo2?.euiccCiPKIdListForSigning.map(x => x.substr(0, 16)).join(", "), raw: euiccInfo2?.euiccCiPKIdListForSigning.join("\n") },
					{key: "euiccCiPKIdListForVerification", rendered: euiccInfo2?.euiccCiPKIdListForVerification.map(x => x.substr(0, 16)).join(", "), raw: euiccInfo2?.euiccCiPKIdListForVerification.join("\n") },
					{key: "profileVersion", rendered: euiccInfo2?.profileVersion },
					{key: "globalplatformVersion", rendered: euiccInfo2?.globalplatformVersion },
					{key: "euiccFirmwareVer", rendered: euiccInfo2?.euiccFirmwareVer },
				]}
				renderItem={({item, index}) => renderRow(item, index, t)}
				keyExtractor={(item: EuiccInfoDataType) => item.key}
			/>
		</SafeScreen>
	);

}

export default EuiccInfo;