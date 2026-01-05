import { useAppMode } from '../lib/UserTierContext';

export const useFeatureAccess = () => {
    const { isAdvancedMode } = useAppMode();

    return {
        isAdvancedMode,
        // All features are now freely available in Advanced mode
        canExportExcel: isAdvancedMode,
        canBatchProcess: isAdvancedMode,
        // No file size limit in either mode
        checkFileSize: () => true,
    };
};
