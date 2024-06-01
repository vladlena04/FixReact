import React, { useState, useCallback, useMemo } from "react";

const URL = "https://jsonplaceholder.typicode.com/users";

type Company = {
  bs: string;
  catchPhrase: string;
  name: string;
};

type User = {
  id: number;
  email: string;
  name: string;
  phone: string;
  username: string;
  website: string;
  company: Company;
  address: any;
};

interface IButtonProps {
  onClick: () => void;
}

// добавление React.memo для оптимизации рендеринга компонента Button
const Button = React.memo(({ onClick }: IButtonProps): JSX.Element => {
  return (
    <button type="button" onClick={onClick}>
      Get random user
    </button>
  );
});

interface IUserInfoProps {
  user: User | null;
}

// добавление React.memo для оптимизации рендеринга компонента UserInfo
const UserInfo = React.memo(({ user }: IUserInfoProps): JSX.Element | null => {
  if (!user) {
    return null;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Username</th>
          <th>Phone number</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{user.name}</td>
          <td>{user.phone}</td>
        </tr>
      </tbody>
    </table>
  );
});

// Создание хука useThrottle для ограничения частоты вызова функции
const useThrottle = (fn: () => void, delay: number) => {
  const [isThrottled, setIsThrottled] = useState(false);

  const throttledFn = useCallback(() => {
    if (isThrottled) return;

    fn();
    setIsThrottled(true);

    setTimeout(() => {
      setIsThrottled(false);
    }, delay);
  }, [fn, delay, isThrottled]);

  return throttledFn;
};

function App(): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  // Добавление кэширования пользователей
  const [userCache, setUserCache] = useState<Record<number, User>>({});

  // Использование useCallback для мемоизации функции receiveRandomUser
  const receiveRandomUser = useCallback(async () => {
    try {
      const id = Math.floor(Math.random() * (10 - 1)) + 1;

      // Проверка наличия пользователя в кэше
      if (userCache[id]) {
        setUser(userCache[id]);
      } else {
        const response = await fetch(`${URL}/${id}`);
        const fetchedUser = (await response.json()) as User;
        setUser(fetchedUser);
        // Добавление пользователя в кэш
        setUserCache((prevCache) => ({ ...prevCache, [id]: fetchedUser }));
      }
    } catch (error) {
      // Перехват исключения при получении случайного пользователя
      console.error("Error fetching user:", error);
    }
  }, [userCache]);

  // Использование useThrottle для ограничения частоты вызова функции receiveRandomUser
  const handleButtonClick = useThrottle(() => {
    receiveRandomUser();
  }, 500);

  return (
    <div>
      <header>Get a random user</header>
      <Button onClick={handleButtonClick} />
      <UserInfo user={user} />
    </div>
  );
}

export default App;