-- 다크모드 도입: task_statuses에 다크 모드용 색상 컬럼 추가, 라이트 색상 값 갱신

alter table public.task_statuses add column color_dark text;

update public.task_statuses set color = '#9CA3AF', color_dark = '#6B7280' where name = '할 일';
update public.task_statuses set color = '#6366F1', color_dark = '#818CF8' where name = '진행 중';
update public.task_statuses set color = '#F59E0B', color_dark = '#FCD34D' where name = '검토 중';
update public.task_statuses set color = '#10B981', color_dark = '#34D399' where name = '완료';
update public.task_statuses set color = '#F97316', color_dark = '#FB923C' where name = '지연됨';
update public.task_statuses set color = '#EF4444', color_dark = '#F87171' where name = '미완료';

alter table public.task_statuses alter column color_dark set not null;
