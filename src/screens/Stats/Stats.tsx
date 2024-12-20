import React from 'react';
import {ScrollView,} from 'react-native';
import {useTranslation} from 'react-i18next';
import SafeScreen from '@/theme/SafeScreen';
import type {RootScreenProps} from "@/screens/navigation";
import Title from "@/components/common/Title";
import Container from "@/components/common/Container";
import {ProfileStats} from "@/screens/Stats/ProfileStats";

function Stats({ route,  navigation }: RootScreenProps<'Stats'>) {

	const { t } = useTranslation(['profile']);
	return (
		<SafeScreen>
			<Title>{t('profile:collection_stats')}</Title>
			<Container>
				<ScrollView>
					<ProfileStats />
				</ScrollView>
			</Container>
		</SafeScreen>
	);

}

export default Stats;
