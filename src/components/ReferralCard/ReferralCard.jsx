import Styles from './ReferralCard.module.css';
import editIcon from '../../assets/edit.svg';
import { useMemo, useState } from 'react';

import red from '../../assets/red.svg'
import yellow from '../../assets/yellow.svg';
import green from '../../assets/green.svg';

const ReferralCard = ({ datas, onEdit }) => {
  
const [copiedId, setCopiedId] = useState(null);


  const statusIcons = {
    'Оформлен': red,
    'Ожидание': yellow,
    'Выплачен': green,
  }
  
const handleCopyId = async (id) => {
  try {
    await navigator.clipboard.writeText(String(id));
    setCopiedId(id);

    setTimeout(() =>{
      setCopiedId(null);
    }, 1500)
  } catch (error) {
    console.error('Не удалось скопировать ID', error);
  }
};


  const sortedDatas = useMemo(() => {
    const statusPriority = {
      "Оформлен": 1,
      "Ожидание": 2,
      "Выплачен": 3
    };

    const parseDate = (dateStr) => {
      if (!dateStr) return 0;
      const [day, month] = dateStr.split('.').map(Number);
      return month * 100 + day;
    };

    return [...datas].sort((a, b) => {
      // Сортировка по статусу (как было)
      const priorityA = statusPriority[a.status] || 99;
      const priorityB = statusPriority[b.status] || 99;
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // === НОВОЕ: в "Выплачены" — сортируем по дате2 по убыванию (свежие сверху) ===
      if (a.status === 'Выплачен' && b.status === 'Выплачен') {
        return parseDate(b.date2) - parseDate(a.date2); // свежие сверху
      }

      // Обычная сортировка по дате2 для остальных статусов
      return parseDate(a.date2) - parseDate(b.date2);
    });
  }, [datas]);

  return (
    <div className={Styles.referrals}>
      {sortedDatas.map((data) => (
        <div className={Styles.referral} key={data.id}>

          <div className={Styles.top}>
              <p className={Styles.text}>
                <img src={statusIcons[data.status] || red} alt={data.status} /> {data.bank} {data.cash} <span className={Styles.gray}> ₽</span>
              </p>

                <span className={Styles.edit} onClick={() => onEdit(data.id)} style={{ cursor: 'pointer' }}>
                  <img src={editIcon} alt="edit" />
                </span>
          </div>

          <div className={Styles.center}>
              <p className={Styles.user}><span className={Styles.gray}>@</span>{data.user.split(' ')[1]}</p>
              <p className={Styles.user}><span className={Styles.gray}>id</span> 
              <span 
              className={`${Styles.copyId} ${copiedId === data.user.trim().split(/\s+/)[0] ? Styles.copied : ''}`}
              onClick={() => handleCopyId(data.user.trim().split(/\s+/)[0])}
              title="Нажмите, чтобы скопировать ID"
              >

              {/* {data.user.split(' ')[0]} */}
              
              {copiedId === data.user.trim().split(/\s+/)[0] ? <span className={Styles.copyTooltip}>Скопировано</span> : data.user.split(' ')[0]}

              {/* {copiedId === data.user.trim().split(/\s+/)[0] && (
                <span className={Styles.copyTooltip}>✔︎</span>
              )} */}
              </span>
              
              </p>
          </div>
              

<div className={Styles.bottom}>
              <p className={Styles.date1}>{data.date1}</p>
              <p className={Styles.date2}>{data.date2}</p>
              <p className={Styles.date3}>{data.date3 || '?'}</p>

              <a href={'tg://user?id=' + data.user.trim().split(/\s+/)[0]}>Open Dialog</a>
</div>
              

            </div>
      ))}
    </div>
  );
};

export default ReferralCard;