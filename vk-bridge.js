// VK Bridge для интеграции с VK Mini Apps
if (typeof VK !== 'undefined') {
    // Инициализация VK Bridge
    vkBridge.send('VKWebAppInit', {});
    
    // Получение данных пользователя VK
    async function getVKUserData() {
        try {
            const userData = await vkBridge.send('VKWebAppGetUserInfo', {});
            return userData;
        } catch (error) {
            console.error('Ошибка получения данных VK:', error);
            return null;
        }
    }
    
    // Открытие клавиатуры
    function showVKKeyboard() {
        vkBridge.send('VKWebAppShowKeyboard', {
            input_type: 'text',
            label: 'Введите текст'
        });
    }
    
    // Закрытие приложения
    function closeVKApp() {
        vkBridge.send('VKWebAppClose', {
            status: 'success'
        });
    }
    
    // Поделиться
    function shareInVK(link, title) {
        vkBridge.send('VKWebAppShare', {
            link: link,
            title: title
        });
    }
    
    // Экспорт функций
    window.VKAPI = {
        getUserData: getVKUserData,
        showKeyboard: showVKKeyboard,
        closeApp: closeVKApp,
        share: shareInVK
    };
} else {
    // Режим разработки вне VK
    console.log('Режим разработки: VK Bridge не доступен');
    window.VKAPI = {
        getUserData: async () => ({ 
            id: 'dev_user', 
            first_name: 'Тестовый', 
            last_name: 'Пользователь' 
        }),
        showKeyboard: () => console.log('VK Keyboard simulation'),
        closeApp: () => console.log('VK App close simulation'),
        share: () => console.log('VK Share simulation')
    };
}